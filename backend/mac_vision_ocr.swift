import Foundation
import Vision
import CoreGraphics
import ImageIO

guard CommandLine.arguments.count > 1 else {
    exit(1)
}
let imagePath = CommandLine.arguments[1]
let url = URL(fileURLWithPath: imagePath)

guard let imageSource = CGImageSourceCreateWithURL(url as CFURL, nil),
      let cgImage = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else {
    fputs("Error: Could not load image\n", stderr)
    exit(2)
}

let request = VNRecognizeTextRequest { request, error in
    guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
    for observation in observations {
        if let topCandidate = observation.topCandidates(1).first {
            print(topCandidate.string)
        }
    }
}

request.recognitionLevel = .accurate
request.usesLanguageCorrection = true
request.recognitionLanguages = ["en-US"]

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
try? handler.perform([request])
