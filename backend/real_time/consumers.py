import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from perfmaster.models import Project, PerformanceMetrics, PerformanceAlerts


class PerformanceMonitorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f'performance_{self.project_id}'
        
        # Check if user has access to this project
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
            return
        
        has_access = await self.check_project_access(user, self.project_id)
        if not has_access:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial project data
        await self.send_initial_data()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_metrics':
                await self.handle_metrics_subscription(data)
            elif message_type == 'performance_update':
                await self.handle_performance_update(data)
            elif message_type == 'request_snapshot':
                await self.handle_snapshot_request(data)
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

    async def handle_metrics_subscription(self, data):
        """Handle subscription to specific metrics"""
        metrics_types = data.get('metrics', ['all'])
        
        # Store subscription preferences
        self.subscribed_metrics = metrics_types
        
        await self.send(text_data=json.dumps({
            'type': 'subscription_confirmed',
            'metrics': metrics_types
        }))

    async def handle_performance_update(self, data):
        """Handle incoming performance data"""
        try:
            # Save performance metrics to database
            await self.save_performance_metrics(data)
            
            # Broadcast to all subscribers in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'performance_metrics',
                    'data': data
                }
            )
            
            # Check for performance alerts
            await self.check_performance_alerts(data)
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Failed to process performance update: {str(e)}'
            }))

    async def handle_snapshot_request(self, data):
        """Handle request for performance snapshot"""
        try:
            snapshot_data = await self.get_performance_snapshot()
            
            await self.send(text_data=json.dumps({
                'type': 'snapshot_data',
                'data': snapshot_data
            }))
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Failed to get snapshot: {str(e)}'
            }))

    # WebSocket message handlers
    async def performance_metrics(self, event):
        """Send performance metrics to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'performance_update',
            'data': event['data']
        }))

    async def performance_alert(self, event):
        """Send performance alert to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'alert',
            'data': event['data']
        }))

    async def analysis_complete(self, event):
        """Send analysis completion notification"""
        await self.send(text_data=json.dumps({
            'type': 'analysis_complete',
            'data': event['data']
        }))

    # Database operations
    @database_sync_to_async
    def check_project_access(self, user, project_id):
        """Check if user has access to the project"""
        try:
            project = Project.objects.get(project_id=project_id)
            return project.created_by == user or user in project.team_members.all()
        except Project.DoesNotExist:
            return False

    @database_sync_to_async
    def save_performance_metrics(self, data):
        """Save performance metrics to database"""
        try:
            project = Project.objects.get(project_id=self.project_id)
            
            PerformanceMetrics.objects.create(
                project=project,
                component_path=data.get('component_path', 'unknown'),
                render_time=data.get('render_time', 0),
                memory_usage=data.get('memory_usage', 0),
                bundle_size=data.get('bundle_size', 0),
                core_web_vitals=data.get('core_web_vitals', {}),
                cpu_usage=data.get('cpu_usage', 0),
                network_requests=data.get('network_requests', 0),
                dom_nodes=data.get('dom_nodes', 0)
            )
            
        except Exception as e:
            print(f"Error saving metrics: {e}")

    @database_sync_to_async
    def check_performance_alerts(self, data):
        """Check if performance data triggers any alerts"""
        try:
            project = Project.objects.get(project_id=self.project_id)
            alerts = []
            
            # Check render time threshold
            if data.get('render_time', 0) > 100:  # 100ms threshold
                alert = PerformanceAlerts.objects.create(
                    project=project,
                    alert_type='render_time_spike',
                    severity='high' if data['render_time'] > 200 else 'medium',
                    message=f"High render time detected: {data['render_time']}ms in {data.get('component_path', 'unknown')}",
                    metadata={'render_time': data['render_time'], 'component': data.get('component_path')}
                )
                alerts.append(alert)
            
            # Check memory usage threshold
            if data.get('memory_usage', 0) > 100:  # 100MB threshold
                alert = PerformanceAlerts.objects.create(
                    project=project,
                    alert_type='memory_leak',
                    severity='high' if data['memory_usage'] > 200 else 'medium',
                    message=f"High memory usage detected: {data['memory_usage']}MB",
                    metadata={'memory_usage': data['memory_usage']}
                )
                alerts.append(alert)
            
            # Broadcast alerts
            for alert in alerts:
                self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'performance_alert',
                        'data': {
                            'alert_id': str(alert.alert_id),
                            'type': alert.alert_type,
                            'severity': alert.severity,
                            'message': alert.message,
                            'timestamp': alert.created_at.isoformat()
                        }
                    }
                )
                
        except Exception as e:
            print(f"Error checking alerts: {e}")

    @database_sync_to_async
    def get_performance_snapshot(self):
        """Get current performance snapshot"""
        try:
            project = Project.objects.get(project_id=self.project_id)
            
            # Get recent metrics (last hour)
            from django.utils import timezone
            from datetime import timedelta
            
            recent_metrics = PerformanceMetrics.objects.filter(
                project=project,
                timestamp__gte=timezone.now() - timedelta(hours=1)
            )
            
            if not recent_metrics.exists():
                return {'message': 'No recent metrics available'}
            
            # Calculate averages
            from django.db.models import Avg
            averages = recent_metrics.aggregate(
                avg_render_time=Avg('render_time'),
                avg_memory_usage=Avg('memory_usage'),
                avg_bundle_size=Avg('bundle_size'),
                avg_cpu_usage=Avg('cpu_usage')
            )
            
            # Get component breakdown
            component_metrics = recent_metrics.values('component_path').annotate(
                avg_render_time=Avg('render_time'),
                count=models.Count('metric_id')
            ).order_by('-avg_render_time')[:10]
            
            return {
                'project_id': str(project.project_id),
                'project_name': project.name,
                'snapshot_time': timezone.now().isoformat(),
                'averages': averages,
                'component_breakdown': list(component_metrics),
                'total_metrics': recent_metrics.count()
            }
            
        except Exception as e:
            return {'error': str(e)}

    async def send_initial_data(self):
        """Send initial project data when client connects"""
        try:
            initial_data = await self.get_performance_snapshot()
            
            await self.send(text_data=json.dumps({
                'type': 'initial_data',
                'data': initial_data
            }))
            
        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Failed to load initial data: {str(e)}'
            }))


class TeamCollaborationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for team collaboration features"""
    
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f'team_{self.project_id}'
        
        # Check authentication and project access
        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
            return
        
        has_access = await self.check_project_access(user, self.project_id)
        if not has_access:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify team members of user joining
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user': user.username,
                'timestamp': timezone.now().isoformat()
            }
        )

    async def disconnect(self, close_code):
        # Notify team members of user leaving
        user = self.scope['user']
        if not user.is_anonymous:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user': user.username,
                    'timestamp': timezone.now().isoformat()
                }
            )
        
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'optimization_applied':
                await self.handle_optimization_notification(data)
            elif message_type == 'analysis_shared':
                await self.handle_analysis_sharing(data)
            elif message_type == 'comment':
                await self.handle_comment(data)
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

    async def handle_optimization_notification(self, data):
        """Handle optimization application notifications"""
        user = self.scope['user']
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'optimization_update',
                'user': user.username,
                'data': data,
                'timestamp': timezone.now().isoformat()
            }
        )

    async def handle_analysis_sharing(self, data):
        """Handle analysis result sharing"""
        user = self.scope['user']
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'analysis_shared',
                'user': user.username,
                'data': data,
                'timestamp': timezone.now().isoformat()
            }
        )

    async def handle_comment(self, data):
        """Handle team comments and discussions"""
        user = self.scope['user']
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'team_comment',
                'user': user.username,
                'message': data.get('message', ''),
                'context': data.get('context', {}),
                'timestamp': timezone.now().isoformat()
            }
        )

    # WebSocket message handlers
    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'timestamp': event['timestamp']
        }))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user'],
            'timestamp': event['timestamp']
        }))

    async def optimization_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'optimization_applied',
            'user': event['user'],
            'data': event['data'],
            'timestamp': event['timestamp']
        }))

    async def analysis_shared(self, event):
        await self.send(text_data=json.dumps({
            'type': 'analysis_shared',
            'user': event['user'],
            'data': event['data'],
            'timestamp': event['timestamp']
        }))

    async def team_comment(self, event):
        await self.send(text_data=json.dumps({
            'type': 'comment',
            'user': event['user'],
            'message': event['message'],
            'context': event['context'],
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def check_project_access(self, user, project_id):
        """Check if user has access to the project"""
        try:
            project = Project.objects.get(project_id=project_id)
            return project.created_by == user or user in project.team_members.all()
        except Project.DoesNotExist:
            return False
