CREATE TABLE Guestbook (
                           guestbookSeq INT AUTO_INCREMENT PRIMARY KEY,
                           ownerSeq INT NOT NULL,  -- 방명록 주인의 ID
                           writerSeq INT NOT NULL, -- 작성자의 ID
                           content VARCHAR(255) NOT NULL,
                           createdAt VARCHAR(15) NOT NULL,
                           updatedAt VARCHAR(15) NOT NULL,
                           deletedAt VARCHAR(15) NULL,
                           isDeleted CHAR(1) NOT NULL DEFAULT 'N'
);