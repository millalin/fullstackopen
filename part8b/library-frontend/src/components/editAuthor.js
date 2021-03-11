import React, { useState } from 'react'

const EditAuthor = (props) => {
  const [name, setName] = useState('')
  const [setBornTo, setYear] = useState('')

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    
    console.log('edit')

    await props.editAuthor({
      variables: {name, setBornTo}
    })

    setName('')
    setYear('')
  }


  return (
    <div>
      <form onSubmit={submit}>
      <h2>Set birthyear</h2>
      <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            type="number" 
            value={setBornTo}
            onChange={({ target }) => setYear(Number(target.value))}
          />
        </div>
        <button type='submit'>Edit authors born year</button>
    </form>
    </div>
  )
}

export default EditAuthor