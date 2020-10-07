const menus = {
    main: `
      foc-sp [command] <options>
      
      parse ............... parses a file or folder of *.srt to JSON
      version ............. show package version
      help ................ show help menu for a command`,

    parse: `
      foc-sp parse <options>
      
      --file, -f ......... the file to parse
      --all, -a .......... parse all files in folder
      --recursive, -r .... used in combination with --all; include subfolders
    `,
}

module.exports = (args) => {
    const subCmd = args._[0] === 'help'
        ? args._[1]
        : args._[0]

    console.log(menus[subCmd] || menus.main);
}
