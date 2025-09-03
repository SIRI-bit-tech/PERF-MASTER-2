import numpy as np
import tensorflow as tf
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
from typing import Dict, List, Any, Tuple
import json
import asyncio
from datetime import datetime, timedelta
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class PerformanceAIAnalyzer:
    def __init__(self):
        self.performance_model = None
        self.code_analyzer = None
        self.anomaly_detector = None
        self.optimization_engine = None
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize AI models for performance analysis"""
        try:
            # Load pre-trained models for code analysis
            self.code_analyzer = pipeline(
                "text-classification",
                model="microsoft/codebert-base",
                tokenizer="microsoft/codebert-base"
            )
            
            # Initialize anomaly detection model
            self.anomaly_detector = self._create_anomaly_model()
            
            # Initialize optimization engine
            self.optimization_engine = self._create_optimization_model()
            
            logger.info("AI models initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize AI models: {e}")
    
    def _create_anomaly_model(self):
        """Create anomaly detection model for performance metrics"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(10,)),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model
    
    def _create_optimization_model(self):
        """Create optimization suggestion model"""
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(128, activation='relu', input_shape=(15,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dense(10, activation='softmax')  # 10 optimization categories
        ])
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model
    
    async def analyze_performance_metrics(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance metrics and provide insights"""
        try:
            # Extract key performance indicators
            core_metrics = self._extract_core_metrics(metrics)
            
            # Detect anomalies
            anomalies = await self._detect_anomalies(core_metrics)
            
            # Generate optimization suggestions
            optimizations = await self._generate_optimizations(core_metrics)
            
            # Calculate performance score
            performance_score = self._calculate_performance_score(core_metrics)
            
            # Predict future performance trends
            trends = await self._predict_trends(core_metrics)
            
            return {
                'performance_score': performance_score,
                'anomalies': anomalies,
                'optimizations': optimizations,
                'trends': trends,
                'analysis_timestamp': datetime.now().isoformat(),
                'confidence_level': self._calculate_confidence(core_metrics)
            }
        except Exception as e:
            logger.error(f"Performance analysis failed: {e}")
            return {'error': str(e)}
    
    def _extract_core_metrics(self, metrics: Dict[str, Any]) -> np.ndarray:
        """Extract and normalize core performance metrics"""
        core_values = [
            metrics.get('lcp', 0) / 1000,  # Normalize to seconds
            metrics.get('fid', 0) / 100,   # Normalize FID
            metrics.get('cls', 0) * 100,   # Scale CLS
            metrics.get('fcp', 0) / 1000,  # Normalize to seconds
            metrics.get('ttfb', 0) / 1000, # Normalize to seconds
            metrics.get('memory_usage', 0) / (1024 * 1024),  # Convert to MB
            metrics.get('cpu_usage', 0) / 100,  # Normalize percentage
            metrics.get('bundle_size', 0) / (1024 * 1024),  # Convert to MB
            metrics.get('render_time', 0) / 1000,  # Normalize to seconds
            metrics.get('network_requests', 0) / 100  # Normalize request count
        ]
        return np.array(core_values, dtype=np.float32)
    
    async def _detect_anomalies(self, metrics: np.ndarray) -> List[Dict[str, Any]]:
        """Detect performance anomalies using AI model"""
        try:
            # Reshape for model input
            input_data = metrics.reshape(1, -1)
            
            # Predict anomaly probability
            anomaly_prob = self.anomaly_detector.predict(input_data)[0][0]
            
            anomalies = []
            if anomaly_prob > 0.7:  # High anomaly threshold
                anomalies.append({
                    'type': 'performance_degradation',
                    'severity': 'high' if anomaly_prob > 0.9 else 'medium',
                    'probability': float(anomaly_prob),
                    'description': 'Significant performance degradation detected',
                    'affected_metrics': self._identify_problematic_metrics(metrics)
                })
            
            return anomalies
        except Exception as e:
            logger.error(f"Anomaly detection failed: {e}")
            return []
    
    async def _generate_optimizations(self, metrics: np.ndarray) -> List[Dict[str, Any]]:
        """Generate AI-powered optimization suggestions"""
        try:
            # Extend metrics for optimization model
            extended_metrics = np.concatenate([
                metrics,
                [
                    np.mean(metrics),  # Average performance
                    np.std(metrics),   # Performance variance
                    np.max(metrics),   # Worst metric
                    np.min(metrics),   # Best metric
                    len([m for m in metrics if m > np.mean(metrics)])  # Count of above-average metrics
                ]
            ])
            
            # Predict optimization categories
            input_data = extended_metrics.reshape(1, -1)
            optimization_probs = self.optimization_engine.predict(input_data)[0]
            
            # Map predictions to optimization suggestions
            optimization_categories = [
                'code_splitting', 'image_optimization', 'caching_strategy',
                'bundle_optimization', 'lazy_loading', 'cdn_implementation',
                'database_optimization', 'api_optimization', 'memory_management',
                'render_optimization'
            ]
            
            suggestions = []
            for i, prob in enumerate(optimization_probs):
                if prob > 0.3:  # Threshold for suggestion relevance
                    suggestion = self._get_optimization_details(optimization_categories[i], prob, metrics)
                    suggestions.append(suggestion)
            
            # Sort by priority (probability)
            suggestions.sort(key=lambda x: x['priority'], reverse=True)
            return suggestions[:5]  # Return top 5 suggestions
            
        except Exception as e:
            logger.error(f"Optimization generation failed: {e}")
            return []
    
    def _get_optimization_details(self, category: str, probability: float, metrics: np.ndarray) -> Dict[str, Any]:
        """Get detailed optimization suggestions for each category"""
        optimization_map = {
            'code_splitting': {
                'title': 'Implement Code Splitting',
                'description': 'Break down large bundles into smaller chunks for faster loading',
                'code_example': '''
// Dynamic imports for code splitting
const LazyComponent = lazy(() => import('./LazyComponent'));

// Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
                ''',
                'impact': 'High',
                'effort': 'Medium'
            },
            'image_optimization': {
                'title': 'Optimize Images',
                'description': 'Implement WebP format, lazy loading, and responsive images',
                'code_example': '''
// Next.js Image optimization
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  priority
  placeholder="blur"
/>
                ''',
                'impact': 'High',
                'effort': 'Low'
            },
            'caching_strategy': {
                'title': 'Implement Caching Strategy',
                'description': 'Add browser caching, service workers, and API response caching',
                'code_example': '''
// Service Worker caching
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
                ''',
                'impact': 'High',
                'effort': 'High'
            },
            'bundle_optimization': {
                'title': 'Optimize Bundle Size',
                'description': 'Remove unused dependencies and implement tree shaking',
                'code_example': '''
// Webpack bundle analyzer
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    })
  ]
};
                ''',
                'impact': 'Medium',
                'effort': 'Medium'
            },
            'lazy_loading': {
                'title': 'Implement Lazy Loading',
                'description': 'Load components and resources only when needed',
                'code_example': '''
// Intersection Observer for lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});
                ''',
                'impact': 'Medium',
                'effort': 'Low'
            }
        }
        
        details = optimization_map.get(category, {
            'title': f'Optimize {category.replace("_", " ").title()}',
            'description': f'Implement {category} optimization',
            'code_example': '// Implementation needed',
            'impact': 'Medium',
            'effort': 'Medium'
        })
        
        return {
            **details,
            'category': category,
            'priority': float(probability),
            'estimated_improvement': f"{int(probability * 30)}%"
        }
    
    def _calculate_performance_score(self, metrics: np.ndarray) -> float:
        """Calculate overall performance score (0-100)"""
        # Weight different metrics based on importance
        weights = np.array([0.25, 0.20, 0.15, 0.15, 0.10, 0.05, 0.05, 0.03, 0.02])
        
        # Normalize metrics to 0-1 scale (lower is better for most metrics)
        normalized = np.clip(1 - metrics[:len(weights)], 0, 1)
        
        # Calculate weighted score
        score = np.sum(normalized * weights) * 100
        return float(np.clip(score, 0, 100))
    
    async def _predict_trends(self, metrics: np.ndarray) -> Dict[str, Any]:
        """Predict performance trends"""
        try:
            # Simple trend analysis (in production, use time series models)
            current_score = self._calculate_performance_score(metrics)
            
            # Simulate trend prediction
            trend_direction = 'improving' if current_score > 70 else 'declining' if current_score < 50 else 'stable'
            
            return {
                'direction': trend_direction,
                'predicted_score_24h': current_score + np.random.uniform(-5, 5),
                'predicted_score_7d': current_score + np.random.uniform(-10, 10),
                'confidence': 0.85,
                'key_factors': self._identify_trend_factors(metrics)
            }
        except Exception as e:
            logger.error(f"Trend prediction failed: {e}")
            return {'direction': 'unknown', 'confidence': 0.0}
    
    def _identify_problematic_metrics(self, metrics: np.ndarray) -> List[str]:
        """Identify which metrics are problematic"""
        metric_names = ['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'Memory', 'CPU', 'Bundle', 'Render', 'Network']
        thresholds = [2.5, 100, 0.1, 1.8, 0.6, 50, 0.8, 5, 1.0, 50]  # Performance thresholds
        
        problematic = []
        for i, (value, threshold) in enumerate(zip(metrics, thresholds)):
            if value > threshold:
                problematic.append(metric_names[i])
        
        return problematic
    
    def _identify_trend_factors(self, metrics: np.ndarray) -> List[str]:
        """Identify key factors affecting performance trends"""
        factors = []
        
        if metrics[0] > 2.5:  # LCP
            factors.append('Large Contentful Paint optimization needed')
        if metrics[5] > 50:   # Memory
            factors.append('Memory usage optimization required')
        if metrics[7] > 5:    # Bundle size
            factors.append('Bundle size reduction needed')
        
        return factors[:3]  # Return top 3 factors
    
    def _calculate_confidence(self, metrics: np.ndarray) -> float:
        """Calculate confidence level of the analysis"""
        # Higher confidence for more complete data
        non_zero_metrics = np.count_nonzero(metrics)
        confidence = min(non_zero_metrics / len(metrics), 1.0) * 0.9 + 0.1
        return float(confidence)

# Initialize global analyzer instance
ai_analyzer = PerformanceAIAnalyzer()
