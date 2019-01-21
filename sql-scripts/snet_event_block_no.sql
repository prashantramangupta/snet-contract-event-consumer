-- run after create_table.sql is processed
-- this script need to be processed before snet-event-consumer is run for the first time
-- field block_no Integer, replace starting block_no with start block no of the contract 
INSERT INTO registry_events_raw (block_no, event, json_str, processed, transactionHash, logIndex, error_code, error_msg)
VALUES ( starting_block_no, "start", "", 1, "", -1, 0, "");

INSERT INTO mpe_events_raw (block_no, event, json_str, processed, transactionHash, logIndex, error_code, error_msg)
VALUES ( starting_block_no, "start", "", 1, "", -1, 0, "");

INSERT INTO rfai_events_raw (block_no, event, json_str, processed, transactionHash, logIndex, error_code, error_msg)
VALUES ( starting_block_no, "start", "", 1, "", -1, 0, "");
