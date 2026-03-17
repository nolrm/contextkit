# GitHub Actions Workflows

This directory contains automated workflows for publishing ContextKit to npm.

## 🚀 Publishing Workflow

### **`publish.yml` - Automatic Publishing**

**Triggers:** When `package.json` is modified and pushed to main branch

**Features:**

- ✅ Only publishes if version doesn't exist on npm
- ✅ Runs tests before publishing
- ✅ Creates git tags automatically
- ✅ Prevents duplicate publishes

**Usage:**

```bash
# 1. Update version in package.json
npm version patch  # or minor, major

# 2. Commit and push
git add package.json
git commit -m "chore: bump to 0.1.2"
git push origin main

# 3. GitHub Actions automatically:
#    - Runs tests
#    - Checks if version exists on npm
#    - Publishes if new version
#    - Creates git tag
```

## 🎯 How It Works

### **Version Management:**

- **npm requires unique versions** - you can't publish the same version twice
- **Update `package.json`** - change the version number
- **Push to main** - triggers the workflow
- **Smart checking** - only publishes if version is new

### **Example Workflow:**

```bash
# Current version: 0.1.1
npm version patch  # Updates to 0.1.2
git push origin main

# GitHub Actions:
# ✅ Tests pass
# ✅ Version 0.1.2 is new
# ✅ Publishes to npm
# ✅ Creates tag v0.1.2
```

## 🔧 Configuration

### **Required Secrets:**

- `NPM_TOKEN` - npm authentication token
  - Get from: https://www.npmjs.com/settings/tokens
  - Permissions: `Automation` or `Publish`

### **Package Configuration:**

Your `package.json` should have:

```json
{
  "name": "@nolrm/contextkit",
  "version": "0.1.1",
  "publishConfig": {
    "access": "public"
  }
}
```

## 🎵 Version Bumping

### **Patch Version (Bug fixes):**

```bash
npm version patch  # 0.1.1 → 0.1.2
```

### **Minor Version (New features):**

```bash
npm version minor  # 0.1.1 → 0.2.0
```

### **Major Version (Breaking changes):**

```bash
npm version major  # 0.1.1 → 1.0.0
```

## 🚨 Troubleshooting

### **Publish Failures:**

- **Check**: npm token permissions
- **Check**: Version doesn't already exist on npm
- **Check**: All tests pass locally

### **Version Conflicts:**

- **Error**: "Version already exists"
- **Solution**: Bump version in `package.json`
- **Prevention**: Workflow checks automatically

---

**🎵 Happy publishing with ContextKit!**
