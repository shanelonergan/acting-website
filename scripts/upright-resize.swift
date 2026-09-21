// Resizes an image to fit a maximum long edge and writes it upright.
//
// Why not sips: sips preserves the EXIF orientation flag rather than baking
// the rotation into the pixels, so a rotated photo reports landscape
// dimensions while displaying as portrait — which makes the gallery reserve
// the wrong shape for it. `sips -r` rotates the pixels but leaves the flag,
// producing a doubly-rotated file. ImageIO's thumbnail transform applies the
// orientation and writes a file whose stored size is its displayed size.
//
// usage: swift upright-resize.swift <out.jpg> <maxLongEdge> <quality 0-1> <source>
// prints: <width>x<height> of the file written
import Foundation
import ImageIO
import CoreGraphics
import UniformTypeIdentifiers

let args = CommandLine.arguments
guard args.count == 5,
      let maxEdge = Int(args[2]),
      let quality = Double(args[3]) else {
    FileHandle.standardError.write("usage: upright-resize.swift <out.jpg> <maxLongEdge> <quality> <source>\n".data(using: .utf8)!)
    exit(1)
}
let outPath = args[1], srcPath = args[4]

guard let src = CGImageSourceCreateWithURL(URL(fileURLWithPath: srcPath) as CFURL, nil),
      let props = CGImageSourceCopyPropertiesAtIndex(src, 0, nil) as? [CFString: Any],
      let storedW = props[kCGImagePropertyPixelWidth] as? Int,
      let storedH = props[kCGImagePropertyPixelHeight] as? Int else {
    FileHandle.standardError.write("cannot read \(srcPath)\n".data(using: .utf8)!)
    exit(1)
}
// EXIF orientations 5–8 swap the axes when displayed.
let orientation = (props[kCGImagePropertyOrientation] as? Int) ?? 1
let displayLongEdge = max(storedW, storedH)
_ = orientation

// Never upscale: a 1200px original stays 1200px.
let target = min(maxEdge, displayLongEdge)

let opts: [CFString: Any] = [
    kCGImageSourceCreateThumbnailFromImageAlways: true,
    kCGImageSourceThumbnailMaxPixelSize: target,
    kCGImageSourceCreateThumbnailWithTransform: true,   // bakes the rotation in
]
guard let image = CGImageSourceCreateThumbnailAtIndex(src, 0, opts as CFDictionary) else {
    FileHandle.standardError.write("cannot decode \(srcPath)\n".data(using: .utf8)!)
    exit(1)
}
guard let dest = CGImageDestinationCreateWithURL(URL(fileURLWithPath: outPath) as CFURL,
                                                 UTType.jpeg.identifier as CFString, 1, nil) else {
    FileHandle.standardError.write("cannot write \(outPath)\n".data(using: .utf8)!)
    exit(1)
}
// No orientation key written: the pixels are already upright.
CGImageDestinationAddImage(dest, image, [kCGImageDestinationLossyCompressionQuality: quality] as CFDictionary)
guard CGImageDestinationFinalize(dest) else { exit(1) }
print("\(image.width)x\(image.height)")
