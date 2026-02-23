#!/bin/bash
# commit-msg.sh - Commit message hook for ContextKit

set -e

echo "🎵 Running ContextKit commit message validation..."

# Check commit message format
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check if commit message follows conventional format
if ! echo "$COMMIT_MSG" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
    echo "❌ Commit message must follow conventional format:"
    echo "   <type>(<scope>): <description>"
    echo "   Examples:"
    echo "   feat: add new feature"
    echo "   fix(auth): resolve login issue"
    echo "   docs: update README"
    exit 1
fi

# Check minimum length
if [ ${#COMMIT_MSG} -lt 10 ]; then
    echo "❌ Commit message too short (minimum 10 characters)"
    exit 1
fi

echo "✅ Commit message validation passed!"
