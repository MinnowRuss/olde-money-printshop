import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ScanLine,
  Palette,
  FileType2,
  HardDrive,
  Crop,
  MonitorSmartphone,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'File Setup Guide | Olde Money Printshop',
  description:
    'Prepare your files for the best print quality. Resolution, color space, file format, and cropping guidelines from Olde Money Printshop.',
}

const SECTIONS = [
  {
    icon: ScanLine,
    title: 'Resolution',
    content: [
      {
        heading: '300 DPI — Best Results',
        text: 'For the sharpest, most detailed prints, we recommend submitting files at 300 DPI at the final print size. This is the professional standard and will produce prints with no visible pixelation, even at close viewing distances.',
      },
      {
        heading: '150 DPI — Minimum Accepted',
        text: 'We accept files down to 150 DPI at final print size. Prints at this resolution will look good from a normal viewing distance but may show some softness under close inspection. Files below 150 DPI may result in noticeable pixelation and are not recommended.',
      },
      {
        heading: 'How to Check',
        text: 'In Photoshop, go to Image > Image Size and uncheck "Resample." Enter your desired print dimensions and check the resolution field. In Lightroom, check the pixel dimensions of your exported file and divide by the print size in inches.',
      },
    ],
  },
  {
    icon: Palette,
    title: 'Color Space',
    content: [
      {
        heading: 'sRGB — Recommended',
        text: 'For most users, sRGB is the safest choice. It is the standard color space for the web and most consumer displays. Our printers are profiled for sRGB, so what you see on a calibrated monitor will closely match your final print.',
      },
      {
        heading: 'Adobe RGB — For Professionals',
        text: 'If you work in Adobe RGB and have a wide-gamut monitor, you may submit files in Adobe RGB. We will preserve the wider color range during printing. Note that if your monitor is not calibrated for Adobe RGB, colors may shift unexpectedly.',
      },
      {
        heading: 'CMYK Files',
        text: 'We do not recommend submitting CMYK files. Our printers use their own ICC profiles to convert from RGB. If you submit a CMYK file, we will convert it to sRGB before printing, which may cause color shifts.',
      },
    ],
  },
  {
    icon: FileType2,
    title: 'File Formats',
    content: [
      {
        heading: 'JPEG — Photos',
        text: 'JPEG is the most common format and works well for photographs. Save at maximum quality (level 10-12 in Photoshop, or 100% in Lightroom) to minimize compression artifacts. Avoid resaving a JPEG multiple times, as each save introduces additional quality loss.',
      },
      {
        heading: 'TIFF — Maximum Quality',
        text: 'TIFF files preserve full image data with no compression loss. This is the best choice if you want the absolute highest quality. Use 8-bit or 16-bit TIFF with no layers. LZW compression is fine and will reduce file size without any quality loss.',
      },
      {
        heading: 'PNG',
        text: 'We accept PNG files, but they are generally larger than JPEGs with no practical quality advantage for photographic content. PNG is a good choice for graphics with sharp edges or transparency, though transparency will be flattened to white for printing.',
      },
    ],
  },
  {
    icon: HardDrive,
    title: 'File Size Limits',
    content: [
      {
        heading: '50 MB Maximum',
        text: 'Each uploaded image must be 50 MB or smaller. Most high-quality JPEGs fall well within this limit. If your TIFF file exceeds 50 MB, try applying LZW compression or converting to a maximum-quality JPEG.',
      },
      {
        heading: 'Batch Uploads',
        text: 'You may upload multiple images in a single session. There is no limit on the number of files per order, but each individual file must remain under the 50 MB limit.',
      },
    ],
  },
  {
    icon: Crop,
    title: 'Aspect Ratios & Cropping',
    content: [
      {
        heading: 'Common Aspect Ratios',
        text: 'Standard print sizes have specific aspect ratios. For example, an 8x10 has a 4:5 ratio, while an 8x12 has a 2:3 ratio (matching most DSLR sensors). If your image does not match the aspect ratio of your selected print size, it will be cropped to fit.',
      },
      {
        heading: 'Cropping Preview',
        text: 'Our ordering tool shows a live crop preview so you can adjust the framing before placing your order. We recommend leaving a small margin of non-critical content around the edges of your image to account for slight variations in trimming.',
      },
      {
        heading: 'Borderless vs. Bordered',
        text: 'Borderless prints extend the image to the edge of the paper. For borderless printing, we recommend adding at least 0.125 inches of bleed on all sides. Bordered prints include a white margin and do not require bleed.',
      },
    ],
  },
  {
    icon: MonitorSmartphone,
    title: 'Color Calibration',
    content: [
      {
        heading: 'Monitor Calibration',
        text: 'For the most accurate color matching between your screen and your print, we strongly recommend calibrating your monitor with a hardware colorimeter such as a Datacolor SpyderX or X-Rite i1Display. An uncalibrated monitor can display colors very differently from the final print.',
      },
      {
        heading: 'Soft Proofing',
        text: 'If you use Photoshop or Lightroom, enable soft proofing with the sRGB profile to preview how your image will look in print. This will help you identify any colors that fall outside the printable gamut and make adjustments before ordering.',
      },
      {
        heading: 'Screen vs. Print',
        text: 'Prints are viewed with reflected light, while screens emit light. As a result, prints will always appear slightly less bright than they do on screen. This is normal. If you find your prints too dark, try brightening your image by 10-15% before uploading.',
      },
    ],
  },
]

export default function FileSetupPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          File Setup Guide
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
          Properly prepared files produce the best prints. Use this guide to
          make sure your images are ready before you upload.
        </p>
      </div>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <div className="flex items-center gap-2">
              <section.icon className="size-5 text-zinc-500" />
              <h2 className="text-xl font-semibold text-zinc-900">
                {section.title}
              </h2>
            </div>
            <div className="mt-4 space-y-4">
              {section.content.map((item) => (
                <div
                  key={item.heading}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
                >
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {item.heading}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Quick reference */}
        <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
          <h2 className="text-xl font-semibold text-zinc-900">
            Quick Reference
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="pb-2 text-left font-semibold text-zinc-900">
                    Setting
                  </th>
                  <th className="pb-2 text-left font-semibold text-zinc-900">
                    Recommended
                  </th>
                  <th className="pb-2 text-left font-semibold text-zinc-900">
                    Minimum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-2 font-medium text-zinc-900">Resolution</td>
                  <td className="py-2 text-zinc-600">300 DPI</td>
                  <td className="py-2 text-zinc-600">150 DPI</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-zinc-900">Color Space</td>
                  <td className="py-2 text-zinc-600">sRGB</td>
                  <td className="py-2 text-zinc-600">Adobe RGB</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-zinc-900">Format</td>
                  <td className="py-2 text-zinc-600">JPEG (max quality)</td>
                  <td className="py-2 text-zinc-600">TIFF, PNG</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-zinc-900">File Size</td>
                  <td className="py-2 text-zinc-600">Under 50 MB</td>
                  <td className="py-2 text-zinc-600">--</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-zinc-900">Bit Depth</td>
                  <td className="py-2 text-zinc-600">8-bit</td>
                  <td className="py-2 text-zinc-600">16-bit (TIFF only)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center">
          <h2 className="text-xl font-semibold text-zinc-900">
            Files Ready to Go?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Upload your images and start your order. If you run into any issues
            or have questions about file preparation, our team is here to help.
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/image/upload"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Upload Images
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              Get Help
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
