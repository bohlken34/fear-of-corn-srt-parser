To install, run:

`npm install -g @bohlken34/focsp-cli`

To run:

`focsp [command] <options>`

for example:
```
focsp version
focsp help

focsp parse <options>
      
      --file, -f ......... the file to parse
      --speaker, -s ...... sets the default speaker
      --all, -a .......... parse all files in folder
      --recursive, -r .... used in combination with --all; include subfolders
      
focsp check <options>

      --maxChar, -c ...... maximum number of characters in a subtitle (required)
      --interval, -i ..... minimum time interval between subtitles (required)
```
