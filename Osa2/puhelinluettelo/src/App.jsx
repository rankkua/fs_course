import { useState, useEffect } from 'react'
import personService from './services/persons'
import Filter from './components/filter'
import PersonForm from './components/personform'
import Persons from './components/persons'
import Notification from './components/notifications'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    personService.getAll().then(initialPersons => {
      setPersons(initialPersons)
    })
  }, [])

  // 5 sec notification
  const notify = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleFilterChange = (event) => setFilter(event.target.value)

  const addPerson = (event) => {
    event.preventDefault()

    const name = newName.trim()
    const existing = persons.find(
      p => p.name.toLowerCase() === name.toLowerCase()
    )

    if (existing) {
      const ok = window.confirm(
        `${existing.name} is already added to phonebook, replace the old number with a new one?`
      )
      if (ok) {
        personService
          .update(existing.id, { ...existing, number: newNumber })
          .then(returnedPerson => {
            setPersons(
              persons.map(p => (p.id !== existing.id ? p : returnedPerson))
            )
            setNewName('')
            setNewNumber('')
            notify(`Updated number of ${returnedPerson.name}`)
          })
          .catch(() => {

            notify(
              `Information of ${existing.name} has already been removed from server`,
              'error'
            )
            setPersons(persons.filter(p => p.id !== existing.id))
          })
      }
      return
    }

    personService
      .create({ name, number: newNumber })
      .then(returnedPerson => {
        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')
        notify(`Added ${returnedPerson.name}`)
      })
  }

  const deletePerson = (person) => {
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService
        .remove(person.id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== person.id))
          notify(`Deleted ${person.name}`)
        })
        .catch(() => {
          notify(
            `Information of ${person.name} has already been removed from server`,
            'error'
          )
          setPersons(persons.filter(p => p.id !== person.id))
        })
    }
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType} />
      <Filter value={filter} onChange={handleFilterChange} />

      <h3>Add a new</h3>
      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={handleNameChange}
        newNumber={newNumber}
        onNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} onDelete={deletePerson} />
    </div>
  )
}

export default App