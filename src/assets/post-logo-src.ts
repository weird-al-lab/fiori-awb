/** Inline data URI — no network fetch; works with ShellBar logo slot on native img. */
const POST_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 53 53" fill="none"><path d="M53 0H0V53H53V0Z" fill="#FFCC00"/><path d="M24 23.3V10H9.7V20.1H0V33.9H9.7V44H24V30.7H20.6V40.8H13.1V30.7H3.4V23.3H13.1V13.2H20.6V23.3H24Z" fill="#FF0000"/><path d="M43.5623 22.1053C43.5623 24.518 41.5708 26.4 39.0451 26.4H35.2V18.1H39.0451C41.668 18.1 43.5623 19.7889 43.5623 22.1053ZM40.6967 10H26V44H35.2V33.9H40.6967C47.448 33.9 52.6938 28.7486 52.6938 22.0943C52.6938 15.3914 47.351 10 40.6967 10Z" fill="black"/></svg>`

export const POST_LOGO_DATA_URI = `data:image/svg+xml,${encodeURIComponent(POST_LOGO_SVG)}`
