pipeline {
    agent any

    environment {
        APP_NAME = "dx-client"
        APP_DIR  = "/var/www/projects/dx/dx_client"
        APP_ENV  = "dev"
        APP_PORT = "3000"
        BRANCH   = "develop"
        REPO     = "https://github.com/codewithkathir/dx-client.git"
    }

    options {
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                script {
                    if (fileExists('.git')) {
                        sh 'git reset --hard'
                        sh 'git clean -fd'
                    }
                }

                git branch: "${BRANCH}",
                    url: "${REPO}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Build') {
            steps {
                // NEXT_PUBLIC_* values are baked in at build time. The env file
                // lives on the VPS in APP_DIR and is copied into the workspace.
                sh """
                    if [ ! -f ${APP_DIR}/.env.${APP_ENV} ]; then
                        echo "Missing ${APP_DIR}/.env.${APP_ENV} (copy .env.${APP_ENV}.example and fill it in)"
                        exit 1
                    fi

                    cp ${APP_DIR}/.env.${APP_ENV} .env.${APP_ENV}
                    rm -rf .next
                    npm run build:${APP_ENV}
                """
            }
        }

        stage('Deploy') {
            steps {
                // output: "standalone" -> .next/standalone holds server.js and the
                // minimal node_modules; static assets and public/ must be added.
                sh """
                    cp -r .next/static .next/standalone/.next/static
                    if [ -d public ]; then cp -r public .next/standalone/public; fi

                    sudo mkdir -p ${APP_DIR}
                    sudo chown -R \$(whoami) ${APP_DIR}

                    rsync -a --delete \
                    --exclude='.env*' \
                    .next/standalone/ ${APP_DIR}/
                """
            }
        }

        stage('Restart Application') {
            steps {
                sh """
                    pm2 delete ${APP_NAME} || true

                    cd ${APP_DIR}

                    PORT=${APP_PORT} HOSTNAME=0.0.0.0 \
                    pm2 start server.js \
                    --name ${APP_NAME}

                    pm2 save
                """
            }
        }

        stage('Verify') {
            steps {
                sh """
                    sleep 5
                    curl -fsS -o /dev/null -w "HTTP %{http_code}\\n" http://127.0.0.1:${APP_PORT}/
                    pm2 status
                """
            }
        }
    }

    post {
        success {
            echo '✅ DX Client deployed successfully'
        }

        failure {
            echo '❌ Deployment failed'
            sh "pm2 logs ${APP_NAME} --lines 50 --nostream || true"
        }
    }
}
