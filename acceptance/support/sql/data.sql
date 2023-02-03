insert into
    leaflet_uploaded_files(id, date_created, is_enabled, date_last_modified, description, mime, original_filename, `path`, path_uuid, stored_filename)
values
    (1, '2023-01-25 20:00:00.000', true, null, 'Uploaded file #1', 'image/jpeg', 'original_filename_1.jpg', 'images/stored_filename_1.jpg', 'd4b1830d-f368-37a0-88f9-2faf7fa8ded6', 'stored_filename_1.jpg'),
    (2, '2023-01-26 20:00:00.000', true, null, 'Uploaded file #2', 'image/png', 'original_filename_2.png', 'images/stored_filename_2_as_png_image.png', 'a167450b-e162-309d-bac4-fb5149d10512', 'stored_filename_2_as_png_image.png'),
    (3, '2023-01-27 20:00:00.000', true, null, 'Uploaded file #3', 'image/jpeg', 'original_filename_3.jpg', 'images/test_sub/stored_filename_3.jpg', '058c9d47-6ce4-3e48-9c44-35bb9c74b378', 'stored_filename_3.jpg');
