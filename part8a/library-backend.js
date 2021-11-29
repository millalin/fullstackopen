const { ApolloServer, UserInputError, AuthenticationError, gql } = require('apollo-server')
const { isNonNullType } = require('graphql')
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const jwt = require('jsonwebtoken')



const password = process.argv[2]

const MONGODB_URI = `mongodb+srv://millalin:${password}@cluster0.k26ow.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

console.log('connecting to', MONGODB_URI)

const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'


mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks (author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
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
      ): Author,

      createUser(
        username: String!
        favoriteGenre: String!
      ): User,

      login(
        username: String!
        password: String!
      ): Token
  }
`
const { v1: uuid } = require('uuid')

const resolvers = {
  Query: {
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
    allAuthors: async () => { return await Author.find({})},
    me: (root, args, context) => {
      return context.currentUser
    }
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("No auth")
      }
      const auth_inlist = await Author.findOne({name: args.name})
      if (auth_inlist) {
        auth_inlist.bookCount = auth_inlist.bookCount + 1
        auth_inlist.save()
      } else {
        throw new UserInputError("Author not found")
      }
          
      const book = new Book({ ...args, author: auth_inlist})
      try {
        await book.save()
      } catch(error) {
        throw new UserInputError("Failed to save a book")
      }
        return book
    },

    addAuthor: async (root, args) => {          
        const author = new Author({ ...args})
        const namelength = author.name.length

        if (namelength < 3) {
          throw new UserInputError("Too short name")
        }
        return author.save()
      },    
    
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser  
      if (!currentUser) {
        throw new AuthenticationError("No auth")
      }
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      return author.save()
    },

    createUser: async (root, args) => {
      const user = new User({ username: args.username })
  
      return await user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new UserInputError("wrong credentials")
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }
  
      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  },
}


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})