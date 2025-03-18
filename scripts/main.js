
import { getScormApi } from './scorm.js'

(async () => {

    const questions = [{
        question: 'What is the capital of France?',
        answers: ['Paris', 'London', 'New York', 'Berlin'],
        displayTime: '0:05',
        correctAnswer: 'Paris'
    }, {
        question: 'What is the capital of Germany?',
        answers: ['Paris', 'London', 'New York', 'Berlin'],
        displayTime: '0:15',
        correctAnswer: 'Berlin'
    }, {
        question: 'What is the capital of the United States?',
        answers: ['Paris', 'Washington', 'New York', 'Berlin'],
        displayTime: '0:25',
        correctAnswer: 'Washington'
    }, {
        question: 'What is the capital of the United Kingdom?',
        answers: ['Paris', 'London', 'New York', 'Berlin'],
        displayTime: '0:35',
        correctAnswer: 'London'
    }]

    const convertTime = time => {
        const [minutes, seconds] = time.split(':').map(Number)
        return minutes * 60 + seconds
    }

    const videoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    const autoplay = true

    const videoElement = document.querySelector('video')
    const sourceElement = videoElement.querySelector('source')
    const dialogElement = document.querySelector('dialog')
    const questionElement = dialogElement.querySelector('h1')
    const answersElement = dialogElement.querySelector('div')
    const feedbackElement = dialogElement.querySelector('span')
    const continueElement = dialogElement.querySelector('button')

    //  controls controlsList="nodownload" disablePictureInPicture
    videoElement.setAttribute('controls', '')
    videoElement.setAttribute('controlsList', 'nodownload')
    videoElement.setAttribute('disablePictureInPicture', '')

    const type = `video/${videoUrl.includes('.mp4') ? 'mp4' : 'ogg'}`
    sourceElement.src = videoUrl
    sourceElement.type = type
    videoElement.load()
    if (autoplay) videoElement.play()

    continueElement.textContent = 'Continue'
    continueElement.style.display = 'none'
    feedbackElement.style.display = 'none'

    // adjust playback speed
    //videoElement.playbackRate = 1.5

    const showFeedback = (isCorrect, correctIndex) => {
        feedbackElement.textContent = isCorrect
            ? 'That is correct!' : 'That is incorrect!'
        feedbackElement.classList.toggle('correct', isCorrect)
        feedbackElement.classList.toggle('incorrect', !isCorrect)
        feedbackElement.style.display = 'block'

        const buttons = answersElement.querySelectorAll('button')
        buttons.forEach((button, index) => {
            button.disabled = true
            button.classList.toggle('correct', index === correctIndex)
            button.classList.toggle('incorrect', index !== correctIndex)
        })

        continueElement.style.display = 'block'
        continueElement.focus()
    }

    const displayQuestion = ({ question, answers, correctAnswer }) => {

        videoElement.pause()
        questionElement.textContent = question
        answersElement.innerHTML = ''

        answers.forEach((answer, index) => {
            const button = document.createElement('button')
            button.textContent = answer
            button.addEventListener('click', () => {
                const isCorrect = answer === correctAnswer
                const message = isCorrect ? 'Correct!' : 'Incorrect!'
                
                showFeedback(message, index)

            })
            answersElement.appendChild(button)
        })

        dialogElement.showModal()
    }

    continueElement.addEventListener('click', () => {
        feedbackElement.style.display = 'none'
        continueElement.style.display = 'none'
        dialogElement.close()
        videoElement.play()
    })

    // check playback position
    let previousTime = 0
    let currentQuestionIndex = 0
    videoElement.addEventListener('timeupdate', async () => {
        if (currentQuestionIndex >= questions.length) return

        const { currentTime/*, duration*/ } = videoElement
        const currentQuestion = questions[currentQuestionIndex]
        const { displayTime } = currentQuestion
        const time = convertTime(displayTime)

        console.log({ currentTime, time, previousTime })

        if (currentTime >= time && previousTime < time) {
            displayQuestion(currentQuestion)
            currentQuestionIndex++
        }
            
        previousTime = currentTime
    })

})()