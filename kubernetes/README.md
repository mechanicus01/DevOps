# Kubernetes

This directory contains Kubernetes manifests, Helm charts, and container orchestration configurations.

## 📁 Structure

```
kubernetes/
├── manifests/              # Kubernetes manifests
│   ├── apps/              # Application deployments
│   ├── infrastructure/    # Infrastructure components
│   └── monitoring/        # Monitoring stack
├── helm-charts/           # Helm charts
│   ├── app/              # Application chart
│   └── infrastructure/   # Infrastructure charts
├── kustomize/            # Kustomize overlays
├── operators/            # Custom operators
└── scripts/              # Kubernetes utility scripts
```

## 🚀 Quick Start

### Deploy Application

```bash
# Deploy using kubectl
kubectl apply -f manifests/apps/

# Deploy using Helm
helm install my-app helm-charts/app/

# Deploy using Kustomize
kubectl apply -k kustomize/overlays/production/
```

### Access Application

```bash
# Port forward to access the application
kubectl port-forward svc/app-service 8080:80

# Get application URL
kubectl get ingress
```

## 📋 Prerequisites

- Kubernetes cluster (local or cloud)
- kubectl configured
- Helm (for Helm charts)
- Docker images built and pushed to registry

## 🔧 Configuration

### Environment Variables

- `REGISTRY`: Container registry URL
- `IMAGE_TAG`: Image tag to deploy
- `NAMESPACE`: Kubernetes namespace
- `REPLICAS`: Number of replicas

### Secrets Management

- Use Kubernetes secrets for sensitive data
- Consider external secret managers (Vault, AWS Secrets Manager)
- Implement proper RBAC policies

## 📚 Best Practices

- Use namespaces for organization
- Implement resource limits and requests
- Use health checks (liveness and readiness probes)
- Implement proper security policies
- Use persistent volumes for stateful applications
- Monitor resource usage and scaling
- Implement proper backup strategies 