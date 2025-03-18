
const getApiRecursive = window => {
	const { opener, parent } = window
	return window.API || getApiRecursive(opener || parent)
}

const getScormTime = () => {
	const now = new Date()
	const hours = now.getHours().toString()
	const minutes = now.getMinutes().toString().padStart(2, '0')
	const seconds = now.getSeconds().toString().padStart(2, '0')
	return `${hours}:${minutes}:${seconds}`
}

const setCompletion = (api, status, commit = false) => {
	api.LMSSetValue('cmi.core.lesson_status', status)
	if (commit) api.LMSCommit('')
}

const createSetComplete = api => (commit = false) => {
	return setCompletion(api, 'completed', commit)
}

const createSetIncomplete = api => (commit = false) => {
	return setCompletion(api, 'incomplete', commit)
}

const createSetScore = api => (score, max = 100, min = 0, commit = false) => {
	api.LMSSetValue('cmi.core.score.raw', score)
	api.LMSSetValue('cmi.core.score.min', min)
	api.LMSSetValue('cmi.core.score.max', max)
	if (commit) api.LMSCommit('')
}

const createGetScore = api => () => {
	const score = api.LMSGetValue('cmi.core.score.raw')
	const min = api.LMSGetValue('cmi.core.score.min')
	const max = api.LMSGetValue('cmi.core.score.max')
	return { score, min, max }
}

const createSetInteraction = api => {
	return (id, type, response, result, description = '', commit = false) => {
		const index = api.LMSGetValue("cmi.interactions._count")
		const prefix = `cmi.interactions.${index}.`

		const truthyResult = result === true ? 'correct'
			: result === false ? 'incorrect' : result || ''

		api.LMSSetValue(`${prefix}id`, `${id} (${getScormTime()})`)
		api.LMSSetValue(`${prefix}type`, type)
		api.LMSSetValue(`${prefix}student_response`, response)
		api.LMSSetValue(`${prefix}result`, truthyResult)
		api.LMSSetValue(`${prefix}description`, description)
		if (commit) api.LMSCommit('')
	}
}

const createSetLog = api => {
	return (id, response, commit = false) => {
		const index = api.LMSGetValue("cmi.interactions._count")
		const prefix = `cmi.interactions.${index}.`
		const type = response.length <= 250 ? 'fill-in' : 'long-fill-in'
		const responseTrunc = response.length > 2000 ? response.slice(0, 2000) : response

		api.LMSSetValue(`${prefix}id`, `[${getScormTime()}] ${id}`)
		api.LMSSetValue(`${prefix}type`, type)
		api.LMSSetValue(`${prefix}student_response`, responseTrunc)
		api.LMSSetValue(`${prefix}result`, '')

		console.log(`[SCORM LOG] ${id}: ${responseTrunc}`)
		if (commit) api.LMSCommit('')
	}
}


const createApiFunctions = api => ({
	api,
	setComplete: createSetComplete(api),
	setIncomplete: createSetIncomplete(api),
	setScore: createSetScore(api),
	getScore: createGetScore(api),
	setInteraction: createSetInteraction(api),
	setLog: createSetLog(api)
})

export const getScormApi = () => {
	const api = getApiRecursive(window)
	if (!api) return
	
	api.LMSInitialize('')
	window.addEventListener('beforeunload', () => api.LMSFinish())

	return createApiFunctions(api)
}