JCAMP DX To CSV
============

It is a simple application that converts image metadata in JCAMP-DX format to CSV format. This is a two-step process:
1. Select a folder that contains JCAMP files
2. After a folder is selected, a CSV file can be then generated.

This project depends on Eric Bidelman's work on filer.js project. https://github.com/ebidel/filer.js

Thank you very much [Eric Bidelman](https://github.com/ebidel)!

It also includes works from [Kevin Jantzer](https://github.com/kjantzer), <https://gist.github.com/kjantzer/7027717> and [Jim Palmer](https://github.com/overset),
(https://github.com/overset/javascript-natural-sort) for natural sorting.


Supported Browsers
------------------

* Chrome

The library filer.js that leverages HTML5 Filesystem API is only supported in Chrome and is utilized in this application. Therefore, the application only works
in Chrome. Maybe at some point we should turn this application into a Chrome Extension.

Getting started
=======

Usage
-----
Open index.html in Chrome.

Demo Site
-----
http://shwei.github.io/jcamp-to-csv/


Background
=======
JCAMP-DX is a protocol for "exchanging infrared spectra and related chemical and physical information between
spectrometer between data systems." Joint Committee on Atomic and Molecular Physical Data (JCAMP) defined the standard
and published it in the paper, JCAMP-DX: A Standard Form for Exchange of Infrared Spectra in Computer Readable Form, in
 Applied Spectroscopy in 1988.

http://www.ingentaconnect.com/content/sas/sas/1988/00000042/00000001/art00030?token=003d10f941333c4a2f7a3f38765749675d4855346f4f6d4e222435fcbddbf
