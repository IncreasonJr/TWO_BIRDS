/**
 * Profanity filter for Two Birds campus dating
 * Replaces banned words with asterisks while maintaining overall message structure.
 */

const BANNED_WORDS = [
  'anal',
  'anus',
  'arse',
  'ass',
  'asshole',
  'bastard',
  'bitch',
  'blowjob',
  'bollocks',
  'boner',
  'bullshit',
  'cawk',
  'cock',
  'crap',
  'cunt',
  'damn',
  'dick',
  'dildo',
  'douche',
  'fag',
  'faggot',
  'fuck',
  'fucker',
  'fucking',
  'goddamn',
  'hell',
  'homo',
  'jackass',
  'jerk',
  'jizz',
  'kike',
  'motherfucker',
  'nigger',
  'nigga',
  'penis',
  'piss',
  'prick',
  'pussy',
  'queer',
  'retard',
  'scumbag',
  'sex',
  'shit',
  'shitty',
  'slut',
  'spic',
  'tit',
  'tits',
  'twat',
  'vagina',
  'wank',
  'whore',
];

// Construct regex matching any banned word at word boundaries (case-insensitive)
const PROFANITY_REGEX = new RegExp(
  `\\b(${BANNED_WORDS.join('|')})\\b`,
  'gi'
);

export function filterMessage(text: string): string {
  if (!text || typeof text !== 'string') return '';

  return text.replace(PROFANITY_REGEX, (match) => {
    if (match.length <= 2) {
      return '*'.repeat(match.length);
    }
    // Keep first letter and replace the rest with asterisks, e.g. "f***"
    return match[0] + '*'.repeat(match.length - 1);
  });
}

export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return PROFANITY_REGEX.test(text);
}
