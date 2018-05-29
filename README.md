JCAMP DX To CSV
============

It is a simple application that converts image metadata in JCAMP-DX format to CSV format. 

Supported Browsers
------------------

* Chrome

The library filer.js that leverages HTML5 Filesystem API is only supported in Chrome and is utilized in this application. Therefore, the application only works
in Chrome. Maybe at some point we should turn this application into a Chrome Extension.

Getting started
=======

Usage
-----
1. Open index.html or http://shwei.github.io/jcamp-to-csv/ in Chrome.
2. Select a folder that contains JCAMP files. Then click OK.
![Select a folder that contains JCAMP files](../assets/step_1.jpg)
3. When the progress reaches 100%, go to Generate CSV file step and select the Generate button.
4. A result file will be generated with a timestamp in the filename. You can download or remove the result file.
![Result files](../assets/step_2.jpg)

Demo Site
-----

Background
=======
JCAMP-DX is a protocol for "exchanging infrared spectra and related chemical and physical information between
spectrometer between data systems." Joint Committee on Atomic and Molecular Physical Data (JCAMP) defined the standard
and published it in the paper, JCAMP-DX: A Standard Form for Exchange of Infrared Spectra in Computer Readable Form, in
 Applied Spectroscopy in 1988.

http://www.ingentaconnect.com/content/sas/sas/1988/00000042/00000001/art00030?token=003d10f941333c4a2f7a3f38765749675d4855346f4f6d4e222435fcbddbf

Credits
-----
This project depends on Eric Bidelman's work on filer.js project. https://github.com/ebidel/filer.js

Thank you very much [Eric Bidelman](https://github.com/ebidel)!

It also includes works from [Kevin Jantzer](https://github.com/kjantzer), <https://gist.github.com/kjantzer/7027717> and [Jim Palmer](https://github.com/overset),
(https://github.com/overset/javascript-natural-sort) for natural sorting.

