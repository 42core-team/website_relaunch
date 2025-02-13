package service

import (
	"context"
	"io"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

var (
	// Namespace where all game resources will be created
	gameNamespace = "core-games"

	// K8s config
	kubeConfig *rest.Config
)

type K8sService struct {
	clientset *kubernetes.Clientset
}

// NewK8sService creates a new K8s service instance
func NewK8sService(configPath string) (*K8sService, error) {
	var config *rest.Config
	var err error

	if configPath != "" {
		// Load from specified config file
		config, err = clientcmd.BuildConfigFromFlags("", configPath)
	} else {
		// Try to load from local kubeconfig first
		config, err = clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
	}

	if err != nil {
		return nil, err
	}

	kubeConfig = config

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return &K8sService{
		clientset: clientset,
	}, nil
}

// CreateDeployment creates a new deployment with specified labels
func (s *K8sService) CreateDeployment(ctx context.Context, name string, image string, labels map[string]string) (*appsv1.Deployment, error) {
	deployment := &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: gameNamespace,
			Labels:    labels,
		},
		Spec: appsv1.DeploymentSpec{
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  name,
							Image: image,
						},
					},
				},
			},
		},
	}

	return s.clientset.AppsV1().Deployments(gameNamespace).Create(ctx, deployment, metav1.CreateOptions{})
}

// GetPodsByLabel returns all pods matching the given label selector
func (s *K8sService) GetPodsByLabel(ctx context.Context, labelSelector string) (*corev1.PodList, error) {
	return s.clientset.CoreV1().Pods(gameNamespace).List(ctx, metav1.ListOptions{
		LabelSelector: labelSelector,
	})
}

// GetPodByLabel returns a single pod matching the given label selector
func (s *K8sService) GetPodByLabel(ctx context.Context, labelSelector string) (*corev1.Pod, error) {
	pods, err := s.GetPodsByLabel(ctx, labelSelector)
	if err != nil {
		return nil, err
	}

	if len(pods.Items) > 0 {
		return &pods.Items[0], nil
	}
	return nil, nil
}

// StreamPodLogs returns a log stream for the specified pod
func (s *K8sService) StreamPodLogs(ctx context.Context, podName string) (io.ReadCloser, error) {
	opts := &corev1.PodLogOptions{
		Follow: true,
	}

	req := s.clientset.CoreV1().Pods(gameNamespace).GetLogs(podName, opts)
	return req.Stream(ctx)
}

// DeleteDeployment deletes a deployment and its associated resources
func (s *K8sService) DeleteDeployment(ctx context.Context, name string) error {
	return s.clientset.AppsV1().Deployments(gameNamespace).Delete(ctx, name, metav1.DeleteOptions{})
}
