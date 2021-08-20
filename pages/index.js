// Main entry point of your app
import React, {useEffect, useState} from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

// Components
import StreamerGrid from '../components/StreamerGrid'

const Home = () => {

  // State
  const [favoriteChannels, setFavoriteChannels] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Actions
  const interval = setInterval(() => {
    fetchChannels()
  }, 60000)

  const addStreamChannel = async event => {
    // Prevent the page from redirecting
    event.preventDefault()

    const { value } = event.target.elements.name

    if (value) {
      console.log("Input: ", value)

      // Call Twitch Search API
      const path = `https://${window.location.hostname}`

      const response = await fetch(`${path}/api/twitch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: value })
      })

      const json = await response.json()

      console.log("From the server: ", json.data)

      setFavoriteChannels(prevState => [...prevState, json.data])

      // set in DB
      await setChannel(value)

      event.target.elements.name.value = ""
    }

    console.log("value: ", value)
  }

  const fetchChannels = async () => {
    try {
      setIsLoading(true)

      const path = `https://${window.location.hostname}`

      const response = await fetch(`${path}/api/database`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'GET_CHANNELS',
          key: 'CHANNELS'
        })
      })

      if (response.status === 404) {
        console.warn('Channels key could not be found.')
        setIsLoading(false)
      } 

      //bonjwa,rocketbeanstv,...
      const json = await response.json()

      const channelData = []

      if (json) {
        const channelNames = json.data.split(',')

        console.log('CHANNEL NAMES: ', channelNames)

        for await (const channelName of channelNames) {
          console.log('Getting Twitch Data for: ', channelName)

          const channelResponse = await fetch(`${path}/api/twitch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: channelName
            })
          })

          const json = await channelResponse.json()

          if (json.data) {
            channelData.push(json.data)
            console.log(channelData)
          }
        }
      }

      // Set State
      setFavoriteChannels(channelData)
      setIsLoading(false)

    } catch (error) {
      console.warn(error.message)
      setIsLoading(false)
    }
  }

  const setChannel = async value => {
    try {
      const currentStreamers = favoriteChannels.map(channel => channel.display_name.toLowerCase())

      const streamersList = [...currentStreamers, value].join(',')

      const path = `https://${window.location.hostname}`

      const response = await fetch(`${path}/api/database`, {
        method: 'POST',
        body: JSON.stringify({
          key: 'CHANNELS',
          value: streamersList
        })
      })

      if (response.status === 200) {
        console.log(`Set ${streamersList} in DB`)
      }

    } catch (error) {
      console.warn(error)
    }
  }

  // Render Methods
  const renderForm = () => (
    <div className={styles.formContainer}>
      <form onSubmit={addStreamChannel}>
        <input id="name" placeholder="Twitch Channel Name" type="test" required />
        <button type="submit">Add Streamer</button>
      </form>
    </div>
  )

  // UseEffects
  useEffect(() => {
    console.log('CHECKING DB...')
    fetchChannels()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>🎥 Personal Twitch Dashboard</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className={styles.inputContainer}>
        {renderForm()}
        {isLoading && 
          <div className={styles.loadingIndicator}>
            <p>⏳ Loading Streamers...</p>
          </div>
        }
        {!isLoading && 
          <StreamerGrid channels={favoriteChannels} setChannels={setFavoriteChannels} />
        }
      </div>
    </div>
  )
}

export default Home