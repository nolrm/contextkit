#!/bin/bash
# pre-push.sh - Pre-push Quality Gates for ContextKit
# Detects your project type and runs the right checks automatically.

set -e

# ─────────────────────────────────────────────
# Quality Gates — ContextKit Pre-Push Checks
# ─────────────────────────────────────────────

GATE=0
PASSED=0
SKIPPED=0

run_gate() {
  GATE=$((GATE + 1))
  local label="$1"
  shift
  echo "  [$GATE] $label"
  "$@"
  PASSED=$((PASSED + 1))
}

skip_gate() {
  GATE=$((GATE + 1))
  local label="$1"
  local reason="$2"
  echo "  [$GATE] $label — skipped ($reason)"
  SKIPPED=$((SKIPPED + 1))
}

has_cmd() {
  command -v "$1" > /dev/null 2>&1
}

# ── Project Type Detection ──────────────────

detect_project_type() {
  if [ -f "package.json" ]; then
    echo "node"
  elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
    echo "python"
  elif [ -f "Cargo.toml" ]; then
    echo "rust"
  elif [ -f "go.mod" ]; then
    echo "go"
  elif [ -f "composer.json" ]; then
    echo "php"
  elif [ -f "Gemfile" ]; then
    echo "ruby"
  elif [ -f "pom.xml" ] || [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
    echo "java"
  else
    echo "generic"
  fi
}

# ── Framework-Specific Gates ────────────────

run_node_gates() {
  # Determine package manager
  if [ -f "pnpm-lock.yaml" ]; then
    PM="pnpm"
  elif [ -f "yarn.lock" ]; then
    PM="yarn"
  elif [ -f "bun.lockb" ] || [ -f "bun.lock" ]; then
    PM="bun"
  else
    PM="npm"
  fi

  # Gate: TypeScript (check devDependencies/dependencies)
  if grep -q '"typescript"' package.json 2>/dev/null; then
    if has_cmd npx; then
      run_gate "TypeScript type check" npx tsc --noEmit
    else
      skip_gate "TypeScript type check" "npx not found"
    fi
  fi

  # Gate: ESLint (check devDependencies/dependencies)
  if grep -q '"eslint"' package.json 2>/dev/null; then
    if has_cmd npx; then
      run_gate "ESLint" npx eslint .
    else
      skip_gate "ESLint" "npx not found"
    fi
  fi

  # Gate: Prettier (check devDependencies/dependencies)
  if grep -q '"prettier"' package.json 2>/dev/null; then
    if has_cmd npx; then
      run_gate "Prettier format check" npx prettier --check .
    else
      skip_gate "Prettier format check" "npx not found"
    fi
  fi

  # Gate: Build (check scripts.build)
  if grep -q '"build"[[:space:]]*:' package.json 2>/dev/null; then
    run_gate "Build" $PM run build
  fi

  # Gate: Tests (check scripts.test)
  if grep -q '"test"[[:space:]]*:' package.json 2>/dev/null; then
    run_gate "Tests" $PM test
  fi

  # Gate: E2E (check scripts.e2e)
  if grep -q '"e2e"[[:space:]]*:' package.json 2>/dev/null; then
    run_gate "E2E tests" $PM run e2e
  fi
}

run_python_gates() {
  # Gate: Linting (ruff preferred, fallback to flake8)
  if has_cmd ruff; then
    run_gate "Ruff lint" ruff check .
  elif has_cmd flake8; then
    run_gate "Flake8 lint" flake8 .
  else
    skip_gate "Linting" "ruff/flake8 not found"
  fi

  # Gate: Type checking
  if has_cmd mypy; then
    run_gate "Mypy type check" mypy .
  else
    skip_gate "Type check" "mypy not found"
  fi

  # Gate: Formatting
  if has_cmd ruff; then
    run_gate "Ruff format check" ruff format --check .
  elif has_cmd black; then
    run_gate "Black format check" black --check .
  else
    skip_gate "Format check" "ruff/black not found"
  fi

  # Gate: Tests
  if has_cmd pytest; then
    run_gate "Pytest" pytest
  else
    skip_gate "Tests" "pytest not found"
  fi
}

run_rust_gates() {
  if ! has_cmd cargo; then
    skip_gate "Rust checks" "cargo not found"
    return
  fi

  run_gate "Cargo check" cargo check
  if has_cmd cargo-clippy || cargo clippy --version > /dev/null 2>&1; then
    run_gate "Cargo clippy" cargo clippy -- -D warnings
  else
    skip_gate "Cargo clippy" "clippy not installed"
  fi
  run_gate "Cargo test" cargo test
}

run_go_gates() {
  if ! has_cmd go; then
    skip_gate "Go checks" "go not found"
    return
  fi

  # Check if there are any Go source files to analyze
  if ! find . -name '*.go' -not -path './vendor/*' 2>/dev/null | grep -q .; then
    skip_gate "Go vet" "no .go source files found"
    skip_gate "Go test" "no .go source files found"
    return
  fi

  run_gate "Go vet" go vet ./...
  if has_cmd golangci-lint; then
    run_gate "golangci-lint" golangci-lint run
  else
    skip_gate "golangci-lint" "not installed"
  fi
  run_gate "Go test" go test ./...
}

run_php_gates() {
  # Gate: Static analysis
  if has_cmd phpstan; then
    run_gate "PHPStan" phpstan analyse
  elif has_cmd vendor/bin/phpstan; then
    run_gate "PHPStan" vendor/bin/phpstan analyse
  else
    skip_gate "Static analysis" "phpstan not found"
  fi

  # Gate: Tests
  if has_cmd phpunit; then
    run_gate "PHPUnit" phpunit
  elif [ -f "vendor/bin/phpunit" ]; then
    run_gate "PHPUnit" vendor/bin/phpunit
  else
    skip_gate "Tests" "phpunit not found"
  fi
}

run_ruby_gates() {
  # Gate: Linting
  if has_cmd rubocop; then
    run_gate "RuboCop" rubocop
  else
    skip_gate "Linting" "rubocop not found"
  fi

  # Gate: Tests
  if has_cmd rspec; then
    run_gate "RSpec" rspec
  elif has_cmd rake && rake -T 2>/dev/null | grep -q "test"; then
    run_gate "Rake test" rake test
  else
    skip_gate "Tests" "rspec/rake not found"
  fi
}

run_java_gates() {
  # Check if there are any Java/Kotlin source files to analyze
  local has_sources=false
  if find . -name '*.java' -o -name '*.kt' 2>/dev/null | grep -q .; then
    has_sources=true
  fi

  if [ -f "pom.xml" ]; then
    if ! has_cmd mvn; then
      skip_gate "Maven verify" "mvn not found"
    elif [ "$has_sources" = false ]; then
      skip_gate "Maven verify" "no source files found"
    else
      run_gate "Maven verify" mvn verify
    fi
  elif [ -f "build.gradle" ] || [ -f "build.gradle.kts" ]; then
    local gradle_cmd=""
    if [ -f "gradlew" ]; then
      gradle_cmd="./gradlew"
    elif has_cmd gradle; then
      gradle_cmd="gradle"
    else
      skip_gate "Gradle check" "gradle/gradlew not found"
      return
    fi

    # Verify 'check' task exists (requires java/application plugin)
    if $gradle_cmd tasks --quiet 2>/dev/null | grep -q "^check"; then
      run_gate "Gradle check" $gradle_cmd check
    else
      skip_gate "Gradle check" "check task not available"
    fi
  fi
}

run_generic_gates() {
  echo "  No framework detected — no automatic checks to run."
  echo "  💡 Add a package.json, Cargo.toml, go.mod, etc. for automatic Quality Gates."
}

# ── Main ────────────────────────────────────

PROJECT_TYPE=$(detect_project_type)

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  Quality Gates — ContextKit Pre-Push Checks  │"
echo "│  Project: $PROJECT_TYPE"
echo "└─────────────────────────────────────────────┘"
echo ""

case "$PROJECT_TYPE" in
  node)    run_node_gates ;;
  python)  run_python_gates ;;
  rust)    run_rust_gates ;;
  go)      run_go_gates ;;
  php)     run_php_gates ;;
  ruby)    run_ruby_gates ;;
  java)    run_java_gates ;;
  generic) run_generic_gates ;;
esac

echo ""
echo "┌─────────────────────────────────────────────┐"
echo "│  ✅ Quality Gates passed ($PASSED passed, $SKIPPED skipped)"
echo "└─────────────────────────────────────────────┘"
echo ""
