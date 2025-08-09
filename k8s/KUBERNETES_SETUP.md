# Kubernetes Setup for GitHub Actions

This guide explains how to configure Kubernetes authentication for the GitHub Actions deployment pipeline.

## Quick Setup (Recommended)

**You need to configure the `KUBECONFIG_DATA` secret to enable deployments:**

1. **Encode your kubeconfig:**
   ```bash
   cat ~/.kube/config | base64 -w 0
   ```
   Copy the output (it will be a long string)

2. **Add GitHub Secret (choose one option):**

   **Option A: Environment Secrets (Recommended)**
   - Go to your repository → **Settings** → **Environments**
   - For each environment (`prod`, `beta`, `dev`):
     - Click on the environment name
     - Scroll down to **"Environment secrets"**
     - Click **"Add secret"**
     - Name: `KUBECONFIG_DATA`
     - Value: Paste the base64 encoded kubeconfig from step 1
     - Click **"Add secret"**

   **Option B: Repository Secret (Alternative)**
   - Go to your repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `KUBECONFIG_DATA`
   - Value: Paste the base64 encoded kubeconfig from step 1
   - Click **"Add secret"**

3. **Test the deployment:**
   - Go to **Actions** → **Deploy to Kubernetes**
   - Select environment: `dev`
   - Enter image tag: `latest`
   - Click **"Run workflow"**

That's it! Your deployment pipeline is now configured.

## Why Environment Secrets vs Repository Secrets?

- **Environment Secrets**: More secure, allows different kubeconfigs per environment
- **Repository Secrets**: Simpler setup, same kubeconfig for all environments

Since you're using one cluster with different namespaces, either approach works fine.

## Authentication Options

You have two options for authenticating GitHub Actions with your Kubernetes cluster:

### Option 1: Use Kubeconfig (Recommended)

This is the simplest approach since you already have a working kubeconfig.

#### Steps:

1. **Encode your kubeconfig:**
   ```bash
   # Base64 encode your kubeconfig file
   cat ~/.kube/config | base64 -w 0
   ```

2. **Add GitHub Secret:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add a new secret named `KUBECONFIG_DATA`
   - Paste the base64 encoded kubeconfig as the value

3. **The deployment workflow is already configured to use this method**

### Option 2: Create Service Account Tokens

If you prefer to use individual tokens for each environment:

#### Steps:

1. **Create the namespaces:**
   ```bash
   kubectl create namespace production
   kubectl create namespace staging  
   kubectl create namespace development
   ```

2. **Apply the service accounts:**
   ```bash
   kubectl apply -f k8s/service-accounts.yaml
   ```

3. **Extract the tokens:**
   ```bash
   # Production token
   kubectl get secret github-actions-prod-token -n production -o jsonpath='{.data.token}' | base64 -d

   # Staging token  
   kubectl get secret github-actions-staging-token -n staging -o jsonpath='{.data.token}' | base64 -d

   # Development token
   kubectl get secret github-actions-dev-token -n development -o jsonpath='{.data.token}' | base64 -d
   ```

4. **Add GitHub Secrets:**
   - `K8S_SERVER`: `https://api.core-game.d73233a8b1.s.ske.eu01.onstackit.cloud`
   - `PROD_K8S_TOKEN`: (production token from step 3)
   - `STAGING_K8S_TOKEN`: (staging token from step 3)  
   - `DEV_K8S_TOKEN`: (development token from step 3)

5. **Update the deployment workflow** to use token-based authentication instead of kubeconfig

## Current Cluster Information

Based on your kubeconfig:

- **Cluster Name**: `core-game`
- **Server**: `https://api.core-game.d73233a8b1.s.ske.eu01.onstackit.cloud`
- **Authentication**: Certificate-based (client-certificate-data + client-key-data)

## Recommended Approach

**Use Option 1 (Kubeconfig)** because:
- ✅ Simpler setup (just one secret)
- ✅ Uses your existing authentication method
- ✅ No need to create additional service accounts
- ✅ Already configured in the deployment workflow

## Testing the Setup

After configuring authentication, test the deployment:

1. **Manual deployment test:**
   ```bash
   # Go to Actions → Deploy to Kubernetes
   # Select environment: dev
   # Enter image tag: latest
   # Run workflow
   ```

2. **Automatic deployment test:**
   ```bash
   # Push to a branch to trigger automatic deployment
   git checkout -b test-deployment
   git push origin test-deployment
   ```

## Troubleshooting

### Authentication Issues
- Verify the kubeconfig is properly base64 encoded
- Check that the secret name matches exactly: `KUBECONFIG_DATA`
- Ensure the kubeconfig has the correct cluster server URL

### Permission Issues
- If using service accounts, verify RBAC permissions are correctly applied
- Check that namespaces exist before deployment
- Verify service account tokens are not expired

### Connection Issues
- Confirm the cluster server URL is accessible from GitHub Actions runners
- Check if there are any firewall restrictions
- Verify the certificate authority data is correct

## Security Best Practices

1. **Limit Permissions**: Service accounts should have minimal required permissions
2. **Rotate Credentials**: Regularly rotate kubeconfig certificates and tokens
3. **Environment Separation**: Use different credentials for each environment
4. **Monitor Access**: Review deployment logs and cluster access regularly

## Next Steps

1. Choose your authentication method (Option 1 recommended)
2. Configure the GitHub secret(s)
3. Test the deployment pipeline
4. Set up monitoring and alerting for deployments 