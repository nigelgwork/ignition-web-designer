# Web Designer User Guide

**Version**: 0.5.0
**Last Updated**: 2025-11-02

This guide explains how to use the Web Designer to edit Perspective views in your Ignition Gateway.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Working with Projects and Views](#working-with-projects-and-views)
4. [Editing Component Properties](#editing-component-properties)
5. [Adding Components](#adding-components)
6. [Deleting Components](#deleting-components)
7. [Saving Your Changes](#saving-your-changes)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Tips and Best Practices](#tips-and-best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Designer

1. Open your web browser
2. Navigate to your Ignition Gateway:
   ```
   http://your-gateway:8088/res/webdesigner/
   ```
3. You should see the Web Designer interface with three panels

### System Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Ignition Gateway 8.3.0 or higher
- Web Designer module installed and running
- At least one Perspective project with views

---

## Interface Overview

The Web Designer uses a three-panel layout similar to professional IDE tools:

### Left Sidebar

**Project Tree** (Top)
- Lists all Perspective projects
- Expandable to show views within each project
- Click refresh button (↻) to reload projects

**Component Palette** (Bottom)
- Library of draggable Perspective components
- Organized by category (Layout, Input, Display)
- Click arrows to expand/collapse categories

### Center Canvas

**Main Editing Area**
- Displays the selected view's component tree
- Click components to select them
- Drop zone for adding new components
- Shows view path in header
- Displays modification indicator when changes are made
- Save button to persist changes

### Right Sidebar

**Property Editor**
- Shows properties of the selected component
- Click any property value to edit it
- Automatically validates and parses values
- Provides Save/Cancel buttons during editing

---

## Working with Projects and Views

### Loading a Project

1. Look at the **Project Tree** in the left sidebar
2. If you see "No projects found", click the refresh button (↻)
3. Projects should appear as collapsible tree items

> **Note**: Currently displays placeholder data. API integration pending Gateway deployment.

### Opening a View

1. Click on a project name in the tree
2. The project expands to show its views
3. Click on a view name
4. The Canvas loads and displays the view's component tree

### Refreshing the Project List

- Click the refresh button (↻) next to "Projects" header
- This reloads the project list from the Gateway

---

## Editing Component Properties

### Selecting a Component

1. In the Canvas, click on any component box
2. The component highlights (blue border on hover)
3. The Property Editor (right sidebar) updates to show properties

### Viewing Properties

The Property Editor displays:
- **Component path**: e.g., `root.children[0].children[1]`
- **Properties section**: All component properties with their current values

### Editing a Property

1. **Click on any property value** in the Property Editor
2. A textarea input appears
3. **Edit the value**:
   - For text: just type
   - For numbers: enter numeric values
   - For booleans: type `true` or `false`
   - For objects/arrays: edit the JSON structure
4. **Save your changes**:
   - Click the **Save** button, or
   - Press **Enter** (without Shift)
5. **Cancel editing**:
   - Click the **Cancel** button, or
   - Press **Escape**

### Property Value Types

The editor automatically parses values:

**String**
```
Hello World
```

**Number**
```
42
```

**Boolean**
```
true
```

**Object**
```json
{
  "width": 200,
  "height": 100
}
```

**Array**
```json
["item1", "item2", "item3"]
```

> **Tip**: For multi-line objects/arrays, use Shift+Enter to add new lines

---

## Adding Components

### Using Drag-and-Drop

1. **Find a component** in the Component Palette (left sidebar)
2. **Click and drag** the component
3. **Drop it** onto a component in the Canvas
4. The new component is added as a child

### Available Components

**Layout Category:**
- Container (Flex)
- Coordinate Container
- Column Container

**Input Category:**
- Text Field
- Text Area
- Button
- Checkbox
- Radio Group

**Display Category:**
- Label
- Image
- Icon
- Table

### After Adding

- The new component appears in the Canvas
- "● Modified" indicator appears in the Canvas header
- Component is automatically assigned a unique name
- Default properties are set based on component type

---

## Deleting Components

### Deleting a Component

1. **Select the component** you want to delete (click it in Canvas)
2. **Click the ✕ button** in the component's header
3. **Confirm the deletion** in the popup dialog
4. The component is removed

### Important Notes

- **Cannot delete the root component**
- Deleting a component removes all its children
- This action marks the view as modified
- Changes are not saved until you click Save

---

## Saving Your Changes

### The Save Workflow

1. **Make any edits** (property changes, add components, delete components)
2. **Notice the indicator**: "● Modified" appears in orange next to the Save button
3. **Click the Save button** in the Canvas header
4. **Wait for confirmation**: Alert shows "View saved successfully!"
5. **Indicator clears**: "● Modified" disappears

### When to Save

- After making a batch of related changes
- Before switching to a different view
- Before closing the browser
- Periodically during long editing sessions

### Save Button States

**Enabled (Blue)**
- View has unsaved modifications
- Click to save changes

**Disabled (Gray)**
- No modifications to save
- Cannot click

**Saving... (Blue, Disabled)**
- Save operation in progress
- Wait for completion

---

## Keyboard Shortcuts

### Current Shortcuts

**During Property Editing:**
- **Enter**: Save the edited property value
- **Escape**: Cancel editing and discard changes

### Planned Shortcuts (Phase 6)

- **Ctrl+S** / **Cmd+S**: Save view
- **Delete**: Delete selected component
- **Ctrl+Z** / **Cmd+Z**: Undo
- **Ctrl+Y** / **Cmd+Y**: Redo

---

## Tips and Best Practices

### General Tips

1. **Save frequently**: Click Save after each significant change
2. **Use consistent naming**: Give components meaningful names
3. **Test your changes**: Save and test in Perspective before making more edits
4. **Check the console**: Browser console shows API calls and errors

### Property Editing Tips

1. **Validate JSON**: When editing objects/arrays, ensure valid JSON syntax
2. **Check types**: Numbers should be numeric, not quoted strings
3. **Use quotes for strings**: Text values in JSON need quotes
4. **Format for readability**: Use proper indentation for nested objects

Example of well-formatted object property:
```json
{
  "style": {
    "width": "200px",
    "height": "100px",
    "backgroundColor": "#1e1e1e"
  }
}
```

### Component Organization

1. **Use containers**: Group related components in containers
2. **Logical hierarchy**: Organize components in a tree that makes sense
3. **Limit nesting depth**: Too many levels can be hard to manage
4. **Name consistently**: Use clear, descriptive component names

### Before Saving

1. **Review changes**: Look at what you've modified
2. **Test locally**: If possible, preview changes
3. **Check console**: No JavaScript errors should appear
4. **Verify structure**: Component tree looks correct

---

## Troubleshooting

### "No projects found"

**Cause**: API integration pending or no projects exist

**Solutions**:
1. Click the refresh button (↻)
2. Verify you have Perspective projects in your Gateway
3. Check browser console for API errors
4. See [DEPLOYMENT.md](DEPLOYMENT.md) for API integration steps

---

### Canvas shows "Failed to Load View"

**Cause**: View content couldn't be loaded from API

**Solutions**:
1. Check browser console for error messages
2. Verify the view exists in the Perspective project
3. Ensure API endpoints are working (see DEPLOYMENT.md)
4. Try refreshing the page

---

### Property changes don't persist after Save

**Cause**: Save API endpoint is returning success but not actually saving

**Solutions**:
1. Check browser Network tab for PUT request
2. Verify request body contains your changes
3. Review Gateway logs for errors
4. API integration may be needed (see DEPLOYMENT.md)

---

### "● Modified" indicator won't clear

**Cause**: Save operation failed but didn't show an error

**Solutions**:
1. Check browser console for errors
2. Try saving again
3. Reload the page and re-make changes
4. Verify Gateway is responding to PUT requests

---

### Component palette is empty

**Cause**: Frontend code issue or browser error

**Solutions**:
1. Refresh the browser page (F5)
2. Clear browser cache
3. Check browser console for JavaScript errors
4. Verify module is properly installed

---

### Drag-and-drop doesn't work

**Cause**: Browser compatibility or JavaScript error

**Solutions**:
1. Use a modern browser (Chrome, Firefox, Edge)
2. Check browser console for errors
3. Try clicking component in palette first
4. Refresh the page

---

### Property editor shows "No properties to display"

**Cause**: Component has no editable properties or structure issue

**Solutions**:
1. Verify component is selected (check Canvas)
2. Try selecting a different component
3. Check browser console for errors
4. View might have unusual structure

---

### Can't delete a component

**Cause**: Trying to delete root, or JavaScript error

**Solutions**:
1. Verify you're not trying to delete the root component
2. Confirm deletion in the dialog
3. Check browser console for errors
4. Try selecting the component again

---

## Advanced Usage

### Editing Complex Properties

Some component properties are complex objects with nested structures:

**Example: Style Property**
```json
{
  "style": {
    "classes": "my-custom-class",
    "width": "100%",
    "height": "200px",
    "backgroundColor": "#252526",
    "borderRadius": "4px"
  }
}
```

**Tips**:
- Use a JSON validator before saving
- Maintain proper indentation
- Include all required commas
- Match bracket pairs

### Working with Arrays

**Example: Children Array**
```json
[
  {
    "type": "ia.display.label",
    "props": {
      "text": "First Label"
    }
  },
  {
    "type": "ia.display.label",
    "props": {
      "text": "Second Label"
    }
  }
]
```

---

## Limitations

### Current Limitations (v0.5.0)

1. **API Integration**: Endpoints return placeholder data until deployed to Gateway
2. **No Undo/Redo**: Changes are immediate; must manually revert
3. **No Keyboard Shortcuts**: Coming in Phase 6
4. **No Component Search**: Must manually browse component tree
5. **No Tag Binding**: Tag browser coming in Phase 7
6. **No Script Editing**: Script editor planned for future
7. **Limited Validation**: Property values not validated beyond JSON syntax

### Planned Improvements

See [README.md](README.md) for full roadmap and upcoming features.

---

## Getting Help

### Resources

- **[README.md](README.md)** - Project overview and roadmap
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Installation and configuration
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture

### Support

For issues, questions, or feedback:
1. Check browser console for errors
2. Review this user guide
3. Consult deployment documentation
4. Review project documentation

---

**Happy Editing!**

The Web Designer team hopes this tool makes your Perspective development faster and more convenient. We're continuously improving the experience based on user feedback.
