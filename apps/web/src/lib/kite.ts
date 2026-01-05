import ky from 'ky'

export const kite = ky.create({
  prefixUrl: 'https://api.kite.trade/',
  headers: {
    'X-Kite-Version': '3',
  },
})
