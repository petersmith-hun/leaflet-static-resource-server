Feature: Test scenarios for file handling endpoints

  @PositiveScenario
  Scenario: Retrieve metadata of all uploaded files

    Given the user is authorized to read:files

     When calling the retrieve files endpoint

     Then the application responds with HTTP status OK
      And the following files are returned
        | Reference                                                                | Path UUID                            | Path                                               | Accepted as | Description      | Original filename       |
        | /d4b1830d-f368-37a0-88f9-2faf7fa8ded6/stored_filename_1.jpg              | d4b1830d-f368-37a0-88f9-2faf7fa8ded6 | images/stored_filename_1.jpg                       | image/jpeg  | Uploaded file #1 | original_filename_1.jpg |
        | /a167450b-e162-309d-bac4-fb5149d10512/stored_filename_2_as_png_image.png | a167450b-e162-309d-bac4-fb5149d10512 | images/stored_filename_2_as_png_image.png          | image/png   | Uploaded file #2 | original_filename_2.png |
        | /058c9d47-6ce4-3e48-9c44-35bb9c74b378/stored_filename_3.jpg              | 058c9d47-6ce4-3e48-9c44-35bb9c74b378 | images/test_sub/stored_filename_3.jpg              | image/jpeg  | Uploaded file #3 | original_filename_3.jpg |

  @NegativeScenario
  Scenario: Retrieving metadata is rejected due to insufficient scope

    Given the user is authorized to read:something

     When calling the retrieve files endpoint

     Then the application responds with HTTP status FORBIDDEN

  @PositiveScenario
  Scenario: Retrieve directories

    Given the user is authorized to read:files

     When calling the retrieve directories endpoint

     Then the application responds with HTTP status OK
      And the following directories are returned
        | ID    | Root   | Children               | Acceptable MIME types                     |
        | image | images | test_sub               | image/*                                   |
        | other | files  | sub1, sub2, sub2/deep1 | application/octet-stream, application/pdf |

  @NegativeScenario
  Scenario: Retrieving directories is rejected due to insufficient scope

    Given the user is authorized to read:something

     When calling the retrieve directories endpoint

     Then the application responds with HTTP status FORBIDDEN

  @PositiveScenario
  Scenario: Retrieve the details of a given file

    Given the user is authorized to read:files
      And the user wants to request the file identified by d4b1830d-f368-37a0-88f9-2faf7fa8ded6

     When calling the retrieve file details endpoint

     Then the application responds with HTTP status OK
      And the following file metadata is returned
        | Reference                                                   | Path UUID                            | Path                                  | Accepted as | Description      | Original filename       |
        | /d4b1830d-f368-37a0-88f9-2faf7fa8ded6/stored_filename_1.jpg | d4b1830d-f368-37a0-88f9-2faf7fa8ded6 | images/stored_filename_1.jpg          | image/jpeg  | Uploaded file #1 | original_filename_1.jpg |

  @NegativeScenario
  Scenario: Retrieving the details of a non-existing file

    Given the user is authorized to read:files
      And the user wants to request the file identified by 32bd31f4-d66e-41ca-8c8e-13e399f27045

     When calling the retrieve file details endpoint

     Then the application responds with HTTP status NOT_FOUND

  @NegativeScenario
  Scenario: Retrieving the details of a file with non-UUID identifier

    Given the user is authorized to read:files
      And the user wants to request the file identified by non-uuid-path-identifier

     When calling the retrieve file details endpoint

     Then the application responds with HTTP status BAD_REQUEST
      And the validation error contains the following entries
        | Field    | Constraint | Message                 |
        | pathUUID | isUuid     | pathUUID must be a UUID |

  @NegativeScenario
  Scenario: Retrieving the details of a given file is rejected due to insufficient scope

    Given the user is authorized to write:files
      And the user wants to request the file identified by d4b1830d-f368-37a0-88f9-2faf7fa8ded6

     When calling the retrieve file details endpoint

     Then the application responds with HTTP status FORBIDDEN

  @PositiveScenario
  Scenario: Downloading the given file - Scenario #1

    Given the user wants to request the file identified by d4b1830d-f368-37a0-88f9-2faf7fa8ded6/stored_filename_1.jpg

     When calling the download endpoint

     Then the application responds with HTTP status OK
      And the contents of the file images/stored_filename_1.jpg are returned as byte stream
      And the Content-Type header contains "image/jpeg"
      And the Content-Length header contains "29"
      And the Cache-Control header contains "max-age=31536000"

  @PositiveScenario
  Scenario: Downloading the given file - Scenario #2

    Given the user wants to request the file identified by a167450b-e162-309d-bac4-fb5149d10512/stored_filename_2_as_png_image.png

     When calling the download endpoint

     Then the application responds with HTTP status OK
      And the contents of the file images/stored_filename_2_as_png_image.png are returned as byte stream
      And the Content-Type header contains "image/png"
      And the Content-Length header contains "42"
      And the Cache-Control header contains "max-age=31536000"

  @NegativeScenario
  Scenario: Downloading the given file is rejected if it does not exist

    Given the user wants to request the file identified by 32bd31f4-d66e-41ca-8c8e-13e399f27045/test.jpg

     When calling the download endpoint

     Then the application responds with HTTP status NOT_FOUND

  @NegativeScenario
  Scenario: Downloading the given file with a non-UUID identifier is rejected

    Given the user wants to request the file identified by non-uuid-identifier/test.jpg

     When calling the download endpoint

     Then the application responds with HTTP status BAD_REQUEST
      And the validation error contains the following entries
        | Field    | Constraint | Message                 |
        | pathUUID | isUuid     | pathUUID must be a UUID |

  @PositiveScenario
  @DirtiesDatabase
  Scenario: Updating the metadata of an existing file

    Given the user is authorized to read:files write:files
      And the user wants to request the file identified by d4b1830d-f368-37a0-88f9-2faf7fa8ded6
      And the user sets the originalFilename to "new_original_filename.jpg"
      And the user sets the description to "New Description"

     When calling the update file metadata endpoint

     Then the application responds with HTTP status CREATED

     When calling the retrieve file details endpoint

     Then the application responds with HTTP status OK
      And the following file metadata is returned
        | Reference                                                   | Path UUID                            | Path                                  | Accepted as | Description      | Original filename         |
        | /d4b1830d-f368-37a0-88f9-2faf7fa8ded6/stored_filename_1.jpg | d4b1830d-f368-37a0-88f9-2faf7fa8ded6 | images/stored_filename_1.jpg          | image/jpeg  | New Description  | new_original_filename.jpg |

  @NegativeScenario
  Scenario: Requesting metadata update for a non-existing file

    Given the user is authorized to write:files
      And the user wants to request the file identified by 32bd31f4-d66e-41ca-8c8e-13e399f27045
      And the user sets the originalFilename to "new_original_filename.jpg"
      And the user sets the description to "New Description"

     When calling the update file metadata endpoint

     Then the application responds with HTTP status NOT_FOUND

  @NegativeScenario
  Scenario: Requesting metadata update with a non-UUID identifier

    Given the user is authorized to write:files
      And the user wants to request the file identified by non-uuid-path-identifier
      And the user sets the originalFilename to "new_original_filename.jpg"
      And the user sets the description to "New Description"

     When calling the update file metadata endpoint

     Then the application responds with HTTP status BAD_REQUEST
      And the validation error contains the following entries
        | Field    | Constraint | Message                 |
        | pathUUID | isUuid     | pathUUID must be a UUID |

  @NegativeScenario
  Scenario: Requesting metadata update is rejected due to insufficient scope

    Given the user is authorized to read:files
      And the user wants to request the file identified by d4b1830d-f368-37a0-88f9-2faf7fa8ded6
      And the user sets the originalFilename to "new_original_filename.jpg"
      And the user sets the description to "New Description"

     When calling the update file metadata endpoint

     Then the application responds with HTTP status FORBIDDEN

  @PositiveScenario
  @DirtiesDatabase
  Scenario: Uploading a new image file into the acceptor root folder

    Given the user is authorized to read:files write:files
      And the user picks an input file called New Uploaded File 1 - Test 1.jpg
      And the user sets the description to "Description for the new file"

     When calling the upload file endpoint

     Then the application responds with HTTP status CREATED
      And the user wants to request the file identified by the location header

     When calling the retrieve file details endpoint

     Then the following file metadata is returned
        | Reference                                   | Path UUID | Path                                    | Accepted as | Description                  | Original filename                |
        | /$pathUUID/new_uploaded_file_1_-_test_1.jpg | $pathUUID | images/new_uploaded_file_1_-_test_1.jpg | image/jpeg  | Description for the new file | New Uploaded File 1 - Test 1.jpg |

  @PositiveScenario
  @DirtiesDatabase
  Scenario: Uploading a new image file into a subfolder of the acceptor root

    Given the user is authorized to read:files write:files
      And the user picks an input file called Árvíztűrő tükörfúrógép 123.png
      And the user sets the subFolder to "test_sub"
      And the user sets the description to "Description for file in the subfolder"

     When calling the upload file endpoint

     Then the application responds with HTTP status CREATED
      And the user wants to request the file identified by the location header

     When calling the retrieve file details endpoint

     Then the following file metadata is returned
        | Reference                                 | Path UUID | Path                                           | Accepted as | Description                           | Original filename              |
        | /$pathUUID/arvizturo_tukorfurogep_123.png | $pathUUID | images/test_sub/arvizturo_tukorfurogep_123.png | image/png   | Description for file in the subfolder | Árvíztűrő tükörfúrógép 123.png |

  @PositiveScenario
  @DirtiesDatabase
  Scenario: Uploading a new PDF file into a deep subfolder

    Given the user is authorized to read:files write:files
      And the user picks an input file called Funny   Memes.pdf
      And the user sets the subFolder to "sub2/deep1"

     When calling the upload file endpoint

     Then the application responds with HTTP status CREATED
      And the user wants to request the file identified by the location header

     When calling the retrieve file details endpoint

     Then the following file metadata is returned
        | Reference                    | Path UUID | Path                               | Accepted as     | Description | Original filename |
        | /$pathUUID/funny___memes.pdf | $pathUUID | files/sub2/deep1/funny___memes.pdf | application/pdf |             | Funny   Memes.pdf |

  @NegativeScenario
  Scenario: Uploading a file of a non-registered type is rejected

    Given the user is authorized to write:files
      And the user picks an input file called my_totally_legit_app.exe

     When calling the upload file endpoint

     Then the application responds with HTTP status BAD_REQUEST

  @NegativeScenario
  Scenario: Uploading a file is rejected when a file is not selected

    Given the user is authorized to write:files

     When calling the upload file endpoint

     Then the application responds with HTTP status BAD_REQUEST
      And the validation error contains the following entries
        | Field     | Constraint | Message                       |
        | inputFile | isNotEmpty | inputFile should not be empty |

  @NegativeScenario
  Scenario: Uploading a file is rejected due to insufficient scope

    Given the user is authorized to read:files
      And the user picks an input file called image1.jpg

     When calling the upload file endpoint

     Then the application responds with HTTP status FORBIDDEN

  @PositiveScenario
  @DirtiesStorage
  Scenario: Creating a new directory right under an acceptor root

    Given the user is authorized to read:files write:files
      And the user sets the parent to "images"
      And the user sets the name to "new_sub_folder_1"

     When calling the create directory endpoint

     Then the application responds with HTTP status CREATED

     When calling the retrieve directories endpoint

      Then the following directories are returned
        | ID    | Root   | Children                   | Acceptable MIME types                     |
        | image | images | new_sub_folder_1, test_sub | image/*                                   |
        | other | files  | sub1, sub2, sub2/deep1     | application/octet-stream, application/pdf |

  @PositiveScenario
  @DirtiesStorage
  Scenario: Creating a new directory under an other subfolder

    Given the user is authorized to read:files write:files
      And the user sets the parent to "files/sub1"
      And the user sets the name to "new_deep2"

     When calling the create directory endpoint

     Then the application responds with HTTP status CREATED

     When calling the retrieve directories endpoint

      Then the following directories are returned
        | ID    | Root   | Children                               | Acceptable MIME types                     |
        | image | images | test_sub                               | image/*                                   |
        | other | files  | sub1, sub1/new_deep2, sub2, sub2/deep1 | application/octet-stream, application/pdf |

  @NegativeScenario
  Scenario: Creating a new directory is rejected due to missing parameters

    Given the user is authorized to write:files

     When calling the create directory endpoint

     Then the application responds with HTTP status BAD_REQUEST
      And the validation error contains the following entries
        | Field  | Constraint | Message                                                |
        | parent | maxLength  | parent must be shorter than or equal to 255 characters |
        | parent | isNotEmpty | parent should not be empty                             |
        | name   | maxLength  | name must be shorter than or equal to 255 characters   |
        | name   | isNotEmpty | name should not be empty                               |

  @NegativeScenario
  Scenario: Creating a new directory is rejected due to insufficient scope

    Given the user is authorized to read:files
      And the user sets the parent to "images"
      And the user sets the name to "new_sub_folder_1"

     When calling the create directory endpoint

     Then the application responds with HTTP status FORBIDDEN

  @PositiveScenario
  @DirtiesDatabase
  @DirtiesStorage
  Scenario: Deleting an existing file

    Given the user is authorized to read:files write:files
      And the user wants to request the file identified by 058c9d47-6ce4-3e48-9c44-35bb9c74b378

     When calling the retrieve file details endpoint

     Then the application responds with HTTP status OK

     When calling the delete file endpoint

     Then the application responds with HTTP status NO_CONTENT

     When calling the retrieve file details endpoint

     Then the application responds with HTTP status NOT_FOUND

  @NegativeScenario
  Scenario: Deleting a non-existing file is rejected

    Given the user is authorized to write:files
      And the user wants to request the file identified by 32bd31f4-d66e-41ca-8c8e-13e399f27045

     When calling the delete file endpoint

     Then the application responds with HTTP status NOT_FOUND

  @NegativeScenario
  Scenario: Deleting a file by a non-UUID identifier is rejected

    Given the user is authorized to write:files
      And the user wants to request the file identified by non-uuid-path-identifier

     When calling the delete file endpoint

     Then the application responds with HTTP status BAD_REQUEST
      And the validation error contains the following entries
        | Field    | Constraint | Message                 |
        | pathUUID | isUuid     | pathUUID must be a UUID |

  @NegativeScenario
  Scenario: Deleting a file is rejected due to insufficient scope

    Given the user is authorized to read:files
      And the user wants to request the file identified by 058c9d47-6ce4-3e48-9c44-35bb9c74b378

     When calling the delete file endpoint

     Then the application responds with HTTP status FORBIDDEN
