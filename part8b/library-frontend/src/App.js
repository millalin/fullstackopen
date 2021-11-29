import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import EditAuthor from './components/editAuthor'
import { gql, useQuery, useMutation } from '@apollo/client'
import LoginForm from './components/loginForm'
import { useApolloClient } from '@apollo/client'

const ALL_AUTHORS = gql`
  {
    allAuthors  {
      name
      born
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
  query {
   allBooks  {
      title
      author {name, born}
      published
      genres
    }
  }
`

const ADD_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int, $genres: [String]!) {
    addBook(
      title: $title,
      name: $author,
      published: $published,
      genres: $genres
    ){
      title
      author{name}
      published
    }
  }
`

const EDIT_AUTH = gql`
  mutation editAuthor($name: String!, $setBornTo: Int) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo,
    ){
      name
      born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`


const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()


  const allauthors = useQuery(ALL_AUTHORS, {
    pollInterval: 2000
  }) 

  const allbooks = useQuery(ALL_BOOKS, {
    pollInterval: 2000
  })

  const [addBook] = useMutation(ADD_BOOK)

  const [editAuthor] = useMutation(EDIT_AUTH)

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  if (!token) {
    return (
      <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('login')}>login</button>
      </div>

      <LoginForm 
        show={page === 'login'} login ={LOGIN} setToken= {(token)=>setToken(token)}
      />

      <Authors show= {page === 'authors'} result={allauthors} 
      />

      <Books
        show={page === 'books'} result={allbooks}
      />


    </div>
    )
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => logout}>log out</button>
      </div>

      <Authors show= {page === 'authors'} result={allauthors} 
      />

      <EditAuthor show = {page === 'authors'} editAuthor={editAuthor}
      />

      <Books
        show={page === 'books'} result={allbooks}
      />

      <NewBook
        show={page === 'add'} result={addBook}
      />

    </div>
  )
}

export default App