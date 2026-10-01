pipeline {
    agent any
    environment{
        BACKEND_IMAGE_NAME = 
        FROATEND_IMAGE_NAME =
    } 
    stages{
        stage ("Code") {
        git(
            url: 'https://github.com/avinashganta5/movie-tickets-booking.git',
            branch: 'main'
            )
    }
    stage("Backend Image Build") {
        dir(./backend) {
            sh "docker image build -t ${BACKEND_IMAGE_NAME}:${BUILD_ID} ."
        }
    }

    }
}