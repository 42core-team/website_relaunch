package kube

import (
	"os"
	"path/filepath"

	"github.com/42core-team/website_relaunch/k8s-service-gen/internal/config"
	"go.uber.org/zap"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type Client struct {
	clientset *kubernetes.Clientset
	namespace string
	logger    *zap.SugaredLogger
	cfg       *config.Config
}

func getKubeConfig(kubePath *string) (*rest.Config, error) {
	inClusterConfig, err := rest.InClusterConfig()
	if err == nil {
		return inClusterConfig, nil
	}

	if kubePath == nil {
		defaultKubePath := filepath.Join(os.Getenv("HOME"), ".kube", "config")
		return clientcmd.BuildConfigFromFlags("", defaultKubePath)
	}

	return clientcmd.BuildConfigFromFlags("", *kubePath)
}

func GetKubeClient(config *config.Config, logger *zap.SugaredLogger) (*Client, error) {
	kubeConfig, err := getKubeConfig(config.KubePath)
	if err != nil {
		return nil, err
	}

	kubeClient := &Client{
		namespace: config.Namespace,
		logger:    logger,
		cfg:       config,
	}
	kubeClient.clientset, err = kubernetes.NewForConfig(kubeConfig)
	if err != nil {
		return nil, err
	}

	return kubeClient, nil
}
