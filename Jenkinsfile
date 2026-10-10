pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        APP_NAME      = 'dx-client-qa'
        APP_ENV       = 'qa'
        APP_PORT      = '7003'
        APP_DIR       = '/var/www/projects/dx/dx-client-qa'
        ENV_FILE      = '/var/www/projects/dx/dx-client-qa/.env.qa'
        DEPLOY_HELPER = '/usr/local/sbin/dx-deploy-client-qa'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Build QA') {
            steps {
                sh '''
                    set -eu

                    test -f "$ENV_FILE" || {
                        echo "ERROR: QA environment file is missing"
                        exit 1
                    }

                    cp "$ENV_FILE" .env.qa

                    APP_ENV=qa npm run build:qa

                    test -f .next/standalone/server.js || {
                        echo "ERROR: Next.js standalone server was not generated"
                        exit 1
                    }

                    mkdir -p .next/standalone/.next

                    cp -a .next/static .next/standalone/.next/static

                    if [ -d public ]; then
                        cp -a public .next/standalone/public
                    fi

                    echo "QA frontend build completed"
                '''
            }
        }

        stage('Deploy QA') {
            steps {
                sh '''
                    set -eu
                    test -f "$DEPLOY_HELPER"
                    sudo -n "$DEPLOY_HELPER"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -eu

                    for attempt in $(seq 1 15); do
                        if curl --fail --silent --show-error \
                            http://127.0.0.1:${APP_PORT}/ \
                            -o /dev/null; then
                            echo "QA frontend health check passed"
                            exit 0
                        fi

                        echo "Waiting for QA frontend (attempt ${attempt}/15)"
                        sleep 2
                    done

                    echo "ERROR: QA frontend health check failed"
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'DX Client QA deployment completed successfully.'
        }
        failure {
            echo 'DX Client QA pipeline failed. Check the stage logs.'
        }
    }
}
