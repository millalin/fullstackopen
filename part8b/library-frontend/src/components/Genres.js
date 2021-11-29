
import React from 'react'

const Genres = ({show, result, pick}) => {
  if (!show) {
    return null
  } else if (result.loading) {
    return <div>loading.. </div>
  }


  return (
    <div>
      <h3>Genres</h3>
      <div key={'Show all genres'}>
          <button onClick={() => pick(null)} >
            allgenres
          </button>
      </div>
      {result.data.genres.map(genre =>
        <div key={genre}>
          <button onClick={() => pick(genre)} >
            {genre}
          </button>
      </div>
      )}
    </div>
  )
}

export default Genres