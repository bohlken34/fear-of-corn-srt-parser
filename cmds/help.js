const menus = {
  main: `
      foc-sp [command] <options>
      
      parse ............... parses a file or folder of *.srt to JSON
      check ............... performs error checking of JSON files
      version ............. show package version
      help ................ show help menu for a command`,

  parse: `
      foc-sp parse <options>
      
      --file, -f ......... the file to parse
      --speaker, -s ...... sets the default speaker
      --all, -a .......... parse all files in folder
      --recursive, -r .... used in combination with --all; include subfolders
    `,

  check: `
      foc-sp check <options>
      
      --maxChar, -c ...... maximum number of characters in a subtitle (required)
      --interval, -i ..... minimum time interval between subtitles (required)
      --hideSkipped, -s .. hide skipped files
    `,
};

module.exports = (arguments_) => {
  const subCmd = arguments_._[0] === 'help' ? arguments_._[1] : arguments_._[0];

  console.log(menus[subCmd] || menus.main);
};
