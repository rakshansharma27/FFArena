/**
 * Browser Web Speech Synthesis Announcer for FFArena Match Outcomes.
 * Supports announcements in English, Hindi, Tamil, Telugu, and Bengali.
 */

export function announceMatchWinner(
  winnerName: string,
  loserName: string,
  winnerScore: number,
  loserScore: number,
  locale: string = "en"
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    console.warn("Web Speech API (speechSynthesis) is not supported in this browser.")
    return
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  let text = ""
  let langCode = "en-US"

  // Dynamic regional translations for authentic Indian gaming announcement feel
  switch (locale.substring(0, 2)) {
    case "hi":
      text = `मैच समाप्त! टीम ${winnerName} ने टीम ${loserName} को ${winnerScore} और ${loserScore} के स्कोर से हरा दिया है! बहुत-बहुत बधाई!`
      langCode = "hi-IN"
      break
    case "ta":
      text = `போட்டி முடிந்தது! ${winnerName} அணி, ${loserName} அணியை ${winnerScore} க்கு ${loserScore} என்ற புள்ளி கணக்கில் தோற்கடித்தது! வாழ்த்துகள்!`
      langCode = "ta-IN"
      break
    case "te":
      text = `మ్యాచ్ ముగిసింది! ${winnerName} జట్టు, ${loserName} జట్టును ${winnerScore} కి ${loserScore} తేడాతో ఓడించింది! అభినందనలు!`
      langCode = "te-IN"
      break
    case "bn":
      text = `খেলা শেষ! টিম ${winnerName}, টিম ${loserName} কে ${winnerScore} এবং ${loserScore} ব্যবধানে পরাজিত করেছে! অভিনন্দন!`
      langCode = "bn-IN"
      break
    case "en":
    default:
      text = `Match completed! Team ${winnerName} has defeated Team ${loserName} with a score of ${winnerScore} to ${loserScore}! Congratulations!`
      langCode = "en-US"
      break
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = langCode
  utterance.rate = 1.05 // Slightly accelerated for energetic sports casting vibe
  utterance.pitch = 1.1 // High excitement pitch
  utterance.volume = 1.0

  // Select an appropriate voice matching the language code if available
  const voices = window.speechSynthesis.getVoices()
  const matchingVoice = voices.find(
    (voice) => voice.lang.startsWith(langCode) || voice.lang.includes(langCode.replace("-", "_"))
  )
  if (matchingVoice) {
    utterance.voice = matchingVoice
  }

  window.speechSynthesis.speak(utterance)
}
