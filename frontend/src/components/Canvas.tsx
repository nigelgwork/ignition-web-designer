/**
 * Canvas component - thin wrapper for backward compatibility
 * The actual implementation has been refactored into smaller components in the canvas/ directory
 */
import CanvasContainer from './canvas/CanvasContainer'

export default function Canvas() {
  return <CanvasContainer />
}
