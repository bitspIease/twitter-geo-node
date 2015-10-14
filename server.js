var Twit = require('twit')
 
var T = new Twit({
  consumer_key: 'Z2LyQpbFs0OzmFRQHPJmmzhoS',
  consumer_secret: '5T5Ep2yQHjf0XiGDUgSRJC38iliTdJg7teutnu50S4Z4e4nMEm',
  access_token: '3837516989-IgSf9kbiEa2Df9EhD0Rut7sPh0QVh5cOJHsMk2j',
  access_token_secret: 'rk40a0TCd7mGcy5HvOqj5gn15VwqgMJpX9S51kgg3iUn3'
})

var stream = T.stream('statuses/filter', { track: 'bits' })
 
stream.on('tweet', function (tweet) {
  console.log(tweet)
})