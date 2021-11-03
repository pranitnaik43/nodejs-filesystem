var fs = require('fs');
var path = require('path');
// const querystring = require('querystring');

const currDirectory = __dirname;
const homeDir = path.dirname(currDirectoryPath);
const storagePath = path.join(homeDir, "Folders");

const Service = {
  async createFileInGivenDirectory(req, res) {
    try {
      // //querystring is deprecated
      // let queryStr = req.url.split("?")[1];
      // let params =  querystring.parse(queryStr);
      // console.log(params);

      let queryStr = req.url.split("?")[1];
      let params = new URLSearchParams(queryStr);
      let folderName = params.get("folder");
      if(!folderName)
        return res.send({ error: { message: "Please provide a folder name" } });

      let dateTime = this.getFormattedDateTime(new Date());
      //create folder if it does not exist
      try {
      await fs.promises.access(path.join(storagePath,folderName));
      }
      catch {
        await fs.mkdir(path.join(storagePath,folderName), (err) => {
          if(err) {
            console.log(err);
          }
        })
      }
      let fileName = dateTime.replaceAll(":", "")+".txt";
      console.log(path.join(storagePath, folderName, fileName))
      fs.writeFile(path.join(storagePath, folderName, fileName), dateTime, (err) => {
        if(err) { 
          console.log(err);
          return res.send({ error: { message: "Error in creating file" } });
        } 
        res.send({ success: { message: "File created successfully." } });
      });
    } catch(err) {
      console.error(err);
    }
  }, 
  async getFilesFromGivenDirectory(req, res) {
    try {
      //get folder name from query string
      let queryStr = req.url.split("?")[1];
      let params = new URLSearchParams(queryStr);
      let folderName = params.get("folder");
      if(!folderName)
        return res.send({ error: { message: "Please provide a folder name" } });
      
      //check if folder exists
      console.log(path.join(storagePath, folderName));
      try {
      await fs.promises.access(path.join(storagePath,folderName));
      }
      catch {
        return res.send({ error: { message: "Folder does not exist" } });
      }

      //get files from the folder
      const files = await fs.promises.readdir(path.join(storagePath, folderName));
      console.log(files);
      
      //if there are no files

      let errorCount = 0;
      let responseData = [];

      //reading content of each file
      await Promise.all(files.map(async (file) => {
        try {
          let content = await fs.promises.readFile(path.join(storagePath, folderName, file), 'utf8');
          responseData.push({fileName: file, content});
        } catch(err) {
          //error in reading file
          console.log(err);
          errorCount+=1;
        }
      }))
      console.log(responseData, errorCount);
      if(responseData.length===0)
        return res.send({ error: { message: "Error in reading files" } });

      let success = { responseData };
      if(errorCount>0) {
        success.message = `Error in reading ${errorCount} files`
      }
      res.send({ success });

    } catch(err) {
      console.error(err);
    }
  },
  prependZero(val){
    val = val.toString();
    if(val.length===1) {
      val = "0" + val;
    }
    return val;
  },
  getFormattedDateTime(date) {
    let dd = this.prependZero(date.getDate());
    let mm = this.prependZero(date.getMonth()+1);
    let yyyy = date.getFullYear();

    let HH = this.prependZero(date.getHours());
    let MM = this.prependZero(date.getMinutes());
    let SS = this.prependZero(date.getSeconds());

    return `${yyyy}-${mm}-${dd}_${HH}:${MM}:${SS}`
  }
}

module.exports = Service;