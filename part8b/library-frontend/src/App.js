import React, { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Genres from './components/Genres'
import EditAuthor from './components/editAuthor'
import { gql, useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client'
import LoginForm from './components/loginForm'
import Recommendations from './components/Recommendations'

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
  query allBooks($genre: String) {
   allBooks(
     genre: $genre
   ) {
      title
      author {name, born}
      published
      genres
    }
  }
`

const FAVORITE_BOOKS = gql`
{
   favoriteBooks {
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

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    author {
      name,
      born,
      bookCount
    } 
    published
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  
${BOOK_DETAILS}
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

export const GENRES = gql`
  {
    genres
  }
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [genre, setGenre] = useState(null)
  const client = useApolloClient()


  const showGenre = (genre) => {
    setGenre(genre)
  }

  const allauthors = useQuery(ALL_AUTHORS, {
    pollInterval: 2000
  }) 

  const allbooks = useQuery(ALL_BOOKS, {
    variables: {genre}
  })

  const favoriteBooks = useQuery(FAVORITE_BOOKS)

  const [addBook] = useMutation(ADD_BOOK)

  const [editAuthor] = useMutation(EDIT_AUTH)

  const listgenres = useQuery(GENRES)


  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData)
      window.alert(`Book added ${subscriptionData.data.bookAdded.title}
      from author ${subscriptionData.data.bookAdded.name}`)
    }
  })

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

      <Genres show={page === 'books'} result={listgenres} pick={(genre) => showGenre(genre)}/>

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
        <button onClick={() => setPage('rec')}>recommendations</button>
        <button onClick={() => logout}>log out</button>
      </div>

      <Authors show= {page === 'authors'} result={allauthors} 
      />

      <EditAuthor show = {page === 'authors'} editAuthor={editAuthor}
      />

      <Genres show={page === 'books'} result={listgenres} pick={(genre) => showGenre(genre)}/>

      <Books
        show={page === 'books'} result={allbooks}
      />

      <NewBook
        show={page === 'add'} result={addBook}
      />

      <Recommendations
        show={page === 'rec'} result={favoriteBooks}
      />

    </div>
  )
}

export default App