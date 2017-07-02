// *Getting the needed dependencies:
const fs       = require('fs');
const path     = require('path');
const split    = require('split');
const isStream = require('isstream');
const streams  = require('./streams');



/**
 * A set of default built-in delimiters regex
 * @readonly
 * @enum {RegExp}
 */
const DELIMITERS = Object.freeze({
   LINE_BY_LINE: /\r?\n/
});



/**
 * A pipe between two streams or files
 * @class
 */
class Pipe{



   /**
    * Starts a new pipe through two streams or files
    * @constructor
    * @param  {Stream|String} input  The input of the pipe (stream or file path)
    * @param  {Stream|String} output The output of the pipe (stream or file path)
    */
   constructor(input, output){
      // *Checking if the input is already a stream:
      if(!isStream(input)){
         // *If it's not:
         // *Checking if it is a string:
         if(typeof input === 'string')
            // *If it is:
            // *Making it a file stream:
            input = fs.createReadStream(path.join(process.cwd(), input), { flags: 'r', defaultEncoding: 'utf8', autoClose: true });
         else
            // *If it's not:
            // *Throwing an error:
            throw new TypeError('\"input\" must be either a Stream object or a file path');
      }

      // *Checking if the output is already a stream:
      if(!isStream(output)){
         // *If it's not:
         // *Checking if it is a string:
         if(typeof output === 'string')
            // *If it is:
            // *Making it a file stream:
            output = fs.createWriteStream(path.join(process.cwd(), output), { flags: 'w', defaultEncoding: 'utf8', autoClose: true });
         else
            // *If it's not:
            // *Throwing an error:
            throw new TypeError('\"output\" must be either a Stream object or a file path');
      }

      // *Assigning the ends of this pipe:
      this._input = input;
      this._output = output;
   }



   /**
    * Provides some built-in delimiters
    * @readonly
    * @enum {RegExp}
    */
   static get DELIMITERS(){
      return DELIMITERS;
   }



   /**
    * Pumps the input to the output through a parse operation
    * @param  {RegExp} regex             The regex to match parse groups
    * @param  {Function} transformation  The transformation function fn(Array<match>) => String
    * @param  {Object} options           The parsing options
    * @param  {RegExp} options.delimiter A regex to delimit the parse chunks
    * @return {Promise}                  Resolves when the parse finishes, or rejects on any error
    * @see Pipe.DELIMITERS to get the built-in delimiters
    */
   parse(regex, transformation, options){
      // *Returning the parsing promise:
      return new Promise((resolve, reject) => {
         // *Trying to prepare the parsing:
         try{
            // *Throwing an error if the 'regex' isn't a RegExp object:
            if(!(regex instanceof RegExp))
               throw new TypeError('\"regex\" must be a regular expression object (RegExp)');

            // *Throwing an error if the 'transformation' isn't a function:
            if(typeof transformation !== 'function')
               throw new TypeError('\"transformation\" must be a function');

            // *Starting the processing stream using the input:
            let processing = this._input;

            // *Splitting the input into smaller chunks if desired by the user:
            if(options && options.delimiter)
               processing = processing.pipe(split(options.delimiter, null, { trailing: false }));

            // *Pumping through the parser:
            processing = processing
               // *Extracting the matching groups for each chunk:
               .pipe(streams.matcher(regex))
               // *Applying the transformation function to the matches:
               .pipe(streams.transformer(transformation))
               // *Piping the result to the output:
               .pipe(this._output)
               // *Resolving the promise when the pumping have finished:
               .on('finish', () => resolve())
               // *Rejecting on any error:
               .on('error', err => reject(err));
         } catch(err){
            // *Rejecting if something happened:
            reject(err);
         }
      });
   }



   /**
    * Pumps the input to the output through a replacement operation
    * @param  {RegExp} regex             The regex to match groups
    * @param  {String} replacement       The replacement pattern
    * @param  {Object} options           The replacement options
    * @param  {RegExp} options.delimiter A regex to delimit the replacement chunks
    * @return {Promise}                  Resolves when the replacement finishes, or rejects on any error
    * @see Pipe.DELIMITERS to get the built-in delimiters
    */
   replace(regex, replacement, options){
      // *Returning the parsing promise:
      return new Promise((resolve, reject) => {
         // *Trying to prepare the parsing:
         try{
            // *Throwing an error if the 'regex' isn't a RegExp object:
            if(!(regex instanceof RegExp))
               throw new TypeError('\"regex\" must be a regular expression object (RegExp)');

            // *Throwing an error if the 'replacement' isn't a string:
            if(typeof replacement !== 'string')
               throw new TypeError('\"replacement\" must be a string');

            // *Starting the processing stream using the input:
            let processing = this._input;

            // *Splitting the input into smaller chunks if desired by the user:
            if(options && options.delimiter)
               processing = processing.pipe(split(new RegExp('(' + options.delimiter.source + ')', options.delimiter.flags), null, { trailing: false }));

            // *Pumping through the replacer:
            processing = processing
               // *Replacing on each chunk:
               .pipe(streams.replacer(regex, replacement))
               // *Piping the result to the output:
               .pipe(this._output)
               // *Resolving the promise when the pumping have finished:
               .on('finish', () => resolve())
               // *Rejecting on any error:
               .on('error', err => reject(err));
         } catch(err){
            // *Rejecting if something happened:
            reject(err);
         }
      });
   }
}



// *Exporting this class:
module.exports = Pipe;
