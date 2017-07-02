// *Getting the needed dependencies:
const { Transform } = require('stream');



/**
 * Creates a new matcher stream given a regular expression
 *  This stream accepts a chunk of string and return a list of regex matches on that chunk
 * @param  {RegExp} regex     The regex to match againt each chunk of data
 * @return {stream.Transform} The new matcher stream
 */
function matcher(regex){
   // *Starting a chunk counter:
   let chunk_index = -1;

   // *Returning the stream:
   return new Transform({
      objectMode: true,
      transform(chunk, encoding, callback){
         // *Increasing the chunk counter on each chunk of data:
         chunk_index++;
         // *Tring to match the current chunk:
         try{
            // *Starting the match object:
            let match;
            // *Starting the matches list:
            const matches = [];

            // *Matching until the chunk ends:
            do{
               // *Matching against the chunk:
               match = regex.exec(chunk);
               // *Checkin if the match is empty:
               if(!match){
                  // *Checking if the matching already had returned any value before:
                  if(matches.length)
                     // *If it had:
                     // *Finishing this loop:
                     break;
                  else
                     // *If it hadn't:
                     // *Throwing an error, as this chunk didn't match with the regex:
                     throw new Error('The chunk[' + chunk_index + '] doesn\'t match the regex: \"' + chunk.toString(encoding) + '\"');
               }

               // *Adding the match into the list:
               matches.push(match);
            } while(match && regex.global);

            // *Calling the next stream with the matches:
            callback(null, matches);
         } catch(err){
            // *Calling the next stream with an error:
            callback(err, null);
         }
      }
   });
}



/**
 * Creates a new transformer stream given a transformation function
 *  This stream accepts a list of regex matches and outputs a string chunk
 * @param  {Function} transformation The function that transforms the matches into a string output
 * @return {stream.Transform}        The new transformer stream
 */
function transformer(transformation){
   // *Returning the stream:
   return new Transform({
      objectMode: true,
      transform(matches, encoding, callback){
         // *Trying to build the output:
         try{
            // *Building the output using the transformation function:
            const result = matches
               // *Passing the matches to the transformation function:
               .map(match => transformation(match))
               // *Concatenating the results:
               .join('');

            // *Calling the next stream with the output chunk:
            callback(null, result);
         } catch(err){
            // *Calling the next stream with an error:
            callback(err, null);
         }
      }
   });
}



/**
 * Creates a new replacer stream given a regular expression and a replacement pattern
 *  This stream replaces every match of the regex using the replacement pattern
 * @param  {RegExp} regex       The regex to match againt each chunk of data
 * @param  {String} replacement The replacement pattern
 * @return {stream.Transform}   The new replacer stream
 */
function replacer(regex, replacement){
   // *Returning the stream:
   return new Transform({
      objectMode: true,
      transform(chunk, encoding, callback){
         // *Tring to replace on the current chunk:
         try{
            // *Calling the next stream with the replacements done:
            callback(null, chunk.toString(encoding).replace(regex, replacement));
         } catch(err){
            // *Calling the next stream with an error:
            callback(err, null);
         }
      }
   });
}



// *Exporting this module:
module.exports = { matcher, transformer, replacer };
