package service

import (
	"context"
	"fmt"
	"io"
	"log"

	"github.com/42core-team/website_relaunch/k8s-service/internal/pocketbase"
	pb "github.com/42core-team/website_relaunch/k8s-service/internal/pocketbase"
	appsv1 "k8s.io/api/apps/v1"
	batchv1 "k8s.io/api/batch/v1"
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
					RestartPolicy: corev1.RestartPolicyNever,
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
	fmt.Println("Deployment:", deployment)

	return s.clientset.AppsV1().Deployments(gameNamespace).Create(ctx, deployment, metav1.CreateOptions{})
}

// CreateJob creates a new job with specified labels
func (s *K8sService) CreateJob(ctx context.Context, name string, image string, labels map[string]string) (*batchv1.Job, error) {
	job := &batchv1.Job{
		ObjectMeta: metav1.ObjectMeta{
			Name:      name,
			Namespace: gameNamespace,
			Labels:    labels,
		},
		Spec: batchv1.JobSpec{
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					RestartPolicy: corev1.RestartPolicyNever,
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
	fmt.Println("Job:", job)

	return s.clientset.BatchV1().Jobs(gameNamespace).Create(ctx, job, metav1.CreateOptions{})
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
func (s *K8sService) StreamPodLogs(ctx context.Context, match_id string, team_id string) (io.ReadCloser, error) {
	opts := &corev1.PodLogOptions{
		Follow: true,
	}

	labelSelector := fmt.Sprintf("match_id=%s", match_id)
	if team_id != "" {
		labelSelector = fmt.Sprintf("%s,team_id=%s", labelSelector, team_id)
	}
	pod, err := s.GetPodByLabel(ctx, labelSelector)
	if err != nil {
		return nil, fmt.Errorf("failed to get pod: %v", err)
	}
	if pod == nil {
		return nil, fmt.Errorf("no pod found for match %s and team %s", match_id, team_id)
	}
	req := s.clientset.CoreV1().Pods(gameNamespace).GetLogs(pod.Name, opts)
	return req.Stream(ctx)
}

// DeleteDeployment deletes a deployment and its associated resources
func (s *K8sService) DeleteDeployment(ctx context.Context, name string) error {
	return s.clientset.AppsV1().Deployments(gameNamespace).Delete(ctx, name, metav1.DeleteOptions{})
}

// Update DeployMatchContainers to use CreateJob instead of CreateDeployment
func (s *K8sService) DeployMatchContainers(ctx context.Context, match pb.Match) error {
	adminKey := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2xsZWN0aW9uSWQiOiJwYmNfMzE0MjYzNTgyMyIsImV4cCI6MTc0MDA1NDczOCwiaWQiOiJ1MngyNTUyMTQwOXk4MzEiLCJyZWZyZXNoYWJsZSI6ZmFsc2UsInR5cGUiOiJhdXRoIn0.41Ks4FQM17IF7lifmf_VAAZJOjpXgVe8eCcowPC4M5c"
	if adminKey == "" {
		log.Fatal("POCKETBASE_ADMIN_KEY environment variable is not set")
	}
	apiWrapper := pocketbase.NewAPIWrapper("http://pocketbase:8090", adminKey)
	teams, err := apiWrapper.GetMatchTeams(match.ID)
	if err != nil {
		return fmt.Errorf("failed to fetch match teams: %w", err)
	}

	// Create job for the match
	_, err = s.CreateJob(ctx, match.ID, "nginx:latest", map[string]string{"match_id": match.ID})
	if err != nil {
		return fmt.Errorf("failed to create match job: %w", err)
	}

	// Create jobs for each team
	for _, team := range teams {
		fmt.Println("Creating job for team:", team.ID)
		_, err = s.CreateJob(ctx, match.ID+"-"+team.ID, "nginx:latest",
			map[string]string{"match_id": match.ID, "team_id": team.ID})
		if err != nil {
			return fmt.Errorf("failed to create team job: %w", err)
		}
	}
	return nil
}

// You might also want to add a DeleteJob method
func (s *K8sService) DeleteJob(ctx context.Context, name string) error {
	return s.clientset.BatchV1().Jobs(gameNamespace).Delete(ctx, name, metav1.DeleteOptions{})
}
