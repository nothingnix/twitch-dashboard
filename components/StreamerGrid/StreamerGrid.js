import React from 'react'
import Image from 'next/image'
import styles from '../../styles/StreamerGrid.module.css'

const StreamerGrid = ({ channels, setChannels }) => {

  // Actions
const setDBChannels = async channels => {
  try {
    const path = `https://${window.location.hostname}`

    const response = await fetch(`${path}/api/database`, {
      method: 'POST',
      body: JSON.stringify({
        key: 'CHANNELS',
        value: channels
      })
    })

    if (response.status === 200) {
      console.log(`Set ${channels} in DB.`)
    }

  } catch (error) {
    console.warn(error)
  }
}

  const removeChannel = channelId => async () => {
    console.log("Removing channel...")

    const filteredChannels = channels.filter(channel => channel.id !== channelId)

    setChannels(filteredChannels)

    const joinedChannels = filteredChannels.map(channel => channel.display_name.toLowerCase()).join(',')

    await setDBChannels(joinedChannels)
  }

  // Render Method
  const renderGridItem = channel => (
    <div key={channel.id} className={styles.gridItem}>
      <button onClick={removeChannel(channel.id)}>X</button>
      <Image layout="fill" src={channel.thumbnail_url} />
      <div className={styles.gridItemContent}>
        <p>{channel.display_name}</p>
        {channel.is_live && <p>🔴 Live</p>}
        {!channel.is_live && <p>⚫ Offline</p>}
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      <h2>Twitch Dashboard </h2>
      <div className={styles.gridContainer}>
        {channels.map(renderGridItem)}
      </div>
    </div>
  )
}

export default StreamerGrid


