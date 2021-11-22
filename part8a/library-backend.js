const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { isNonNullType } = require('graphql')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')

const password = process.argv[2]

const MONGODB_URI = `mongodb+srv://millalin:${password}@cluster0.k26ow.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]


let books = [

]

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    id: ID
    born: Int
    bookCount: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks (author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
      addBook(
        title: String!
        published: Int
        name: String!
        genres: [String]!
      ): Book,

      addAuthor(
        name: String!
        born: Int
        bookCount: Int
      ): Author,

      editAuthor(
        name: String!
        id: ID
        setBornTo: Int
        bookCount: Int
      ): Author
  }
`
const { v1: uuid } = require('uuid')

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
        if (!args.author && !args.genre ) {
            return await Book.find({}).populate('author')
        }
        if (args.author && !args.genre) {
            return await books.find( {name: args.name})    
        }
        if (args.genre && !args.author) {
            return await books.find( {genres: {$in : [args.genre]}}).populate('author')
        }
        return await books.find({}).populate('author')
    },
    allAuthors: async () => { return await Author.find({})}
  },

  //Author: {
    //bookCount: async (root, args) => {
    //  const author_bookcount = await Author.findOne({ name: args.name})
    //  return author_bookcount.bookCount
    //}  },
  Mutation: {
    addBook: async (root, args) => {
        const auth_inlist = await Author.findOne({name: args.name})
        if (auth_inlist) {
          auth_inlist.bookCount = auth_inlist.bookCount + 1
          auth_inlist.save()
        }
          
        const book = new Book({ ...args, author: auth_inlist})
        return book.save()
      },
    addAuthor: async (root, args) => {          
        const author = new Author({ ...args})
        return author.save()
      },    
    
    editAuthor: async (root, args) => {
        const author = await Author.findOne({ name: args.name })
        author.born = args.setBornTo
        return author.save()
    }
}
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})