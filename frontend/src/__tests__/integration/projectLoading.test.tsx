import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import '@testing-library/jest-dom'
import ProjectTree from '../../components/LeftSidebar/ProjectTree'
import { useProjectStore } from '../../store/projectStore'

/**
 * Integration test for project loading workflow.
 *
 * Tests the complete flow of loading projects from the API,
 * updating the store, and rendering the UI.
 */

// Setup MSW server for API mocking
const server = setupServer(
  // Mock GET /api/v1/projects
  rest.get('/data/webdesigner/api/v1/projects', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        projects: [
          {
            name: 'TestProject1',
            title: 'Test Project 1',
            enabled: true,
          },
          {
            name: 'TestProject2',
            title: 'Test Project 2',
            enabled: true,
          },
        ],
      })
    )
  }),

  // Mock GET /api/v1/projects/{name}/views
  rest.get('/data/webdesigner/api/v1/projects/:name/views', (req, res, ctx) => {
    const { name } = req.params

    if (name === 'TestProject1') {
      return res(
        ctx.status(200),
        ctx.json({
          views: [
            {
              name: 'MainView',
              path: 'MainView',
              title: 'Main View',
            },
            {
              name: 'Settings',
              path: 'Settings',
              title: 'Settings View',
            },
          ],
        })
      )
    }

    return res(ctx.status(404), ctx.json({ error: 'Project not found' }))
  })
)

// Start server before tests
beforeAll(() => server.listen())

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers()
  // Reset store state
  useProjectStore.getState().setProjects([])
  useProjectStore.getState().setCurrentProject(null)
})

// Close server after tests
afterAll(() => server.close())

describe('Project Loading Integration', () => {
  test('loads and displays projects from API', async () => {
    // Act
    render(<ProjectTree />)

    // Assert - Should show loading state initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('TestProject1')).toBeInTheDocument()
      expect(screen.getByText('TestProject2')).toBeInTheDocument()
    })

    // Store should be updated
    const projects = useProjectStore.getState().projects
    expect(projects).toHaveLength(2)
    expect(projects[0].name).toBe('TestProject1')
  })

  test('handles API errors gracefully', async () => {
    // Arrange - Mock error response
    server.use(
      rest.get('/data/webdesigner/api/v1/projects', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }))
      })
    )

    // Act
    render(<ProjectTree />)

    // Assert - Should show error message
    await waitFor(() => {
      expect(
        screen.getByText(/failed to load projects/i)
      ).toBeInTheDocument()
    })

    // Store should be empty
    const projects = useProjectStore.getState().projects
    expect(projects).toHaveLength(0)
  })

  test('handles 401 unauthorized error', async () => {
    // Arrange - Mock 401 response
    server.use(
      rest.get('/data/webdesigner/api/v1/projects', (req, res, ctx) => {
        return res(
          ctx.status(401),
          ctx.json({ error: 'Authentication required' })
        )
      })
    )

    // Act
    render(<ProjectTree />)

    // Assert - Should show authentication error
    await waitFor(() => {
      expect(screen.getByText(/not logged in/i)).toBeInTheDocument()
    })
  })

  test('handles 403 forbidden error', async () => {
    // Arrange - Mock 403 response
    server.use(
      rest.get('/data/webdesigner/api/v1/projects', (req, res, ctx) => {
        return res(ctx.status(403), ctx.json({ error: 'Forbidden' }))
      })
    )

    // Act
    render(<ProjectTree />)

    // Assert - Should show permission error
    await waitFor(() => {
      expect(screen.getByText(/permission/i)).toBeInTheDocument()
    })
  })

  test('loads views when project is expanded', async () => {
    // Arrange
    render(<ProjectTree />)

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('TestProject1')).toBeInTheDocument()
    })

    // Act - Click to expand project
    const projectNode = screen.getByText('TestProject1')
    projectNode.click()

    // Assert - Views should load and display
    await waitFor(() => {
      expect(screen.getByText('MainView')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })
  })

  test('updates current project when selected', async () => {
    // Arrange
    render(<ProjectTree />)

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('TestProject1')).toBeInTheDocument()
    })

    // Act - Select project
    const projectNode = screen.getByText('TestProject1')
    projectNode.click()

    // Assert - Store should be updated
    await waitFor(() => {
      const currentProject = useProjectStore.getState().currentProject
      expect(currentProject).toBe('TestProject1')
    })
  })

  test('handles network errors with retry', async () => {
    // Arrange - Fail first request, succeed on retry
    let attemptCount = 0
    server.use(
      rest.get('/data/webdesigner/api/v1/projects', (req, res, ctx) => {
        attemptCount++
        if (attemptCount === 1) {
          return res.networkError('Network error')
        }
        return res(
          ctx.status(200),
          ctx.json({
            projects: [
              {
                name: 'TestProject1',
                title: 'Test Project 1',
                enabled: true,
              },
            ],
          })
        )
      })
    )

    // Act
    render(<ProjectTree />)

    // Assert - Should eventually succeed after retry
    await waitFor(
      () => {
        expect(screen.getByText('TestProject1')).toBeInTheDocument()
      },
      { timeout: 5000 }
    )

    expect(attemptCount).toBeGreaterThan(1)
  })

  test('displays empty state when no projects available', async () => {
    // Arrange - Mock empty response
    server.use(
      rest.get('/data/webdesigner/api/v1/projects', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            projects: [],
          })
        )
      })
    )

    // Act
    render(<ProjectTree />)

    // Assert - Should show empty state
    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument()
    })
  })

  test('maintains selection when projects reload', async () => {
    // Arrange
    const { rerender } = render(<ProjectTree />)

    // Wait for projects to load
    await waitFor(() => {
      expect(screen.getByText('TestProject1')).toBeInTheDocument()
    })

    // Select project
    screen.getByText('TestProject1').click()

    await waitFor(() => {
      expect(useProjectStore.getState().currentProject).toBe('TestProject1')
    })

    // Act - Reload component
    rerender(<ProjectTree />)

    // Assert - Selection should be maintained
    expect(useProjectStore.getState().currentProject).toBe('TestProject1')
  })
})
