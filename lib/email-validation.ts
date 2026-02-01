// List of blocked consumer/retail email domains
const BLOCKED_EMAIL_DOMAINS = [
  // Google
  'gmail.com',
  'googlemail.com',
  // Microsoft
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'outlook.co.uk',
  'live.com',
  'live.co.uk',
  'msn.com',
  // Yahoo
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.ca',
  'yahoo.com.au',
  'ymail.com',
  'rocketmail.com',
  // Apple
  'icloud.com',
  'me.com',
  'mac.com',
  // AOL
  'aol.com',
  'aim.com',
  // Proton
  'protonmail.com',
  'proton.me',
  'pm.me',
  // Other popular free email providers
  'mail.com',
  'email.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'gmx.net',
  'fastmail.com',
  'tutanota.com',
  'hushmail.com',
  'inbox.com',
  'mail.ru',
  'rediffmail.com',
  'lycos.com',
  'excite.com',
  'att.net',
  'sbcglobal.net',
  'verizon.net',
  'comcast.net',
  'cox.net',
  'charter.net',
  'earthlink.net',
  'juno.com',
  'netzero.net',
  'optonline.net',
  'frontier.com',
  'windstream.net',
  'bellsouth.net',
]

export function isBusinessEmail(email: string): boolean {
  if (!email || !email.includes('@')) {
    return false
  }

  const domain = email.toLowerCase().split('@')[1]
  
  if (!domain) {
    return false
  }

  // Check if the domain is in the blocked list
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return false
  }

  return true
}

export function getEmailValidationError(email: string): string | null {
  if (!email) {
    return 'Email is required'
  }

  if (!email.includes('@')) {
    return 'Please enter a valid email address'
  }

  const domain = email.toLowerCase().split('@')[1]

  if (!domain) {
    return 'Please enter a valid email address'
  }

  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) {
    return 'Please use a corporate or business email address. Personal email addresses (Gmail, Yahoo, Outlook, etc.) are not allowed.'
  }

  return null
}
