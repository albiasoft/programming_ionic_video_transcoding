# Sample code to transcode and upload videos to S3 with Ionic

Note: If you are experiencing issues when using the Cordova VideoEditor plugin on iOS devices then search and replace all the occurrences of the implementation of the function **resultForVideo** (in Objective-C language) for the code bellow.

```objective-c
- (CDVPluginResult*)resultForVideo:(NSDictionary*)info
{
  NSString* moviePath = [[info objectForKey:UIImagePickerControllerMediaURL] path];
  NSArray* spliteArray = [moviePath componentsSeparatedByString: @"/"];
  NSString* lastString = [spliteArray lastObject];
  NSError *error;
  NSFileManager *fileManager = [NSFileManager defaultManager];
  NSString *documentsDirectory = [NSHomeDirectory() stringByAppendingPathComponent:@"tmp"];
  NSString *filePath = [documentsDirectory stringByAppendingPathComponent:lastString];
  [fileManager copyItemAtPath:moviePath toPath:filePath error:&error];
  return [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:filePath];
}
```
