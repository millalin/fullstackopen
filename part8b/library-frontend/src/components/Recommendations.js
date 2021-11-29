const Recommendations = ({show, result}) => {

  if (!show) {
    return null
  } else if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.favoriteBooks

  return (
    <div>
      <h2>Recommendations</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
            <th>
              genre (Your favourite!)
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
              <td>{a.genres}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
      </div>
    </div>
  )
}

export default Recommendations