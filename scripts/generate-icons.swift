import AppKit
import Foundation

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let sourceURL = root.appendingPathComponent("src/assets/brand/numnum-symbol.png")
guard let symbol = NSImage(contentsOf: sourceURL) else {
  fatalError("Missing NumNum symbol at \(sourceURL.path)")
}

func writeIcon(to relativePath: String, canvasSize: Int, symbolWidth: CGFloat, background: NSColor?) throws {
  guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: canvasSize,
    pixelsHigh: canvasSize,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  ), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    throw NSError(domain: "NumNumIcon", code: 1)
  }
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = context
  context.imageInterpolation = .high

  let canvas = CGRect(x: 0, y: 0, width: CGFloat(canvasSize), height: CGFloat(canvasSize))
  if let background {
    background.setFill()
    canvas.fill()
  } else {
    NSColor.clear.setFill()
    canvas.fill(using: .copy)
  }

  let aspect = symbol.size.height / symbol.size.width
  let symbolHeight = symbolWidth * aspect
  symbol.draw(in: CGRect(
    x: (CGFloat(canvasSize) - symbolWidth) / 2,
    y: (CGFloat(canvasSize) - symbolHeight) / 2,
    width: symbolWidth,
    height: symbolHeight
  ))
  context.flushGraphics()
  NSGraphicsContext.restoreGraphicsState()

  guard let png = bitmap.representation(using: .png, properties: [:]) else {
    throw NSError(domain: "NumNumIcon", code: 2)
  }
  try png.write(to: root.appendingPathComponent(relativePath), options: .atomic)
}

try writeIcon(to: "src/assets/brand/icon.png", canvasSize: 1024, symbolWidth: 820, background: .white)
try writeIcon(to: "src/assets/brand/adaptive-icon.png", canvasSize: 1024, symbolWidth: 600, background: nil)
try writeIcon(to: "src/assets/brand/play-store-icon.png", canvasSize: 512, symbolWidth: 410, background: .white)
