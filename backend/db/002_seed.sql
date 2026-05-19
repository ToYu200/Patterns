INSERT INTO games (name, slug, max_team_size) VALUES
('Counter-Strike 2', 'cs2', 5),
('Valorant', 'valorant', 5),
('Dota 2', 'dota2', 5),
('League of Legends', 'lol', 5),
('Overwatch 2', 'overwatch2', 5),
('Apex Legends', 'apex-legends', 3),
('Rocket League', 'rocket-league', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (id, username, email, password_hash, display_name, elo, role) VALUES
('7f4a2f35-8d10-4e0f-a0af-96e81a8c9e21', 'ZeroCool', 'zerocool@example.com', 'seed-hash', 'ZeroCool', 2140, 'player'),
('5b01db29-4385-4df1-9f2d-9d79b8767a50', 'Neo', 'neo@example.com', 'seed-hash', 'Neo', 1995, 'player'),
('9b72d9e6-5d20-4687-a08e-f5c03d857b46', 'Tracer', 'tracer@example.com', 'seed-hash', 'Tracer', 1880, 'player'),
('83f6a54d-e5ff-4d46-b557-19e579e46f13', 'Ragnar', 'ragnar@example.com', 'seed-hash', 'Ragnar', 2410, 'organizer'),
('e86a0a0d-0f72-49b8-b7b7-3d30f93b037a', 'Viper', 'viper@example.com', 'seed-hash', 'Viper', 2060, 'player'),
('4fc583bf-06f6-44f4-a68e-2cf77dd14a4b', 'SovaMain', 'sova@example.com', 'seed-hash', 'SovaMain', 1930, 'player'),
('07b7dd50-f871-4c7f-b778-8470b399b45d', 'Invoker', 'invoker@example.com', 'seed-hash', 'Invoker', 2250, 'player'),
('18ef6c5b-7c55-4fbf-9129-b86089c5e470', 'Jinxed', 'jinxed@example.com', 'seed-hash', 'Jinxed', 1765, 'player'),
('6e0ebae1-63de-4469-8b42-7e311108a82b', 'WraithQ', 'wraithq@example.com', 'seed-hash', 'WraithQ', 1835, 'player'),
('fd77f236-c944-41e1-9379-585fae68b75a', 'OctaneRush', 'octane@example.com', 'seed-hash', 'OctaneRush', 1710, 'player'),
('32cd61df-8a5e-4ef6-a21c-75ec6b3080c7', 'AerialAce', 'aerial@example.com', 'seed-hash', 'AerialAce', 2015, 'player'),
('a58122d4-f0fc-4dd9-90e7-974b84223d97', 'GoalLine', 'goalline@example.com', 'seed-hash', 'GoalLine', 1640, 'player'),
('3db8e704-2d03-4348-947a-40ddba96d2e1', 'NovaAdmin', 'nova.admin@example.com', 'seed-hash', 'NovaAdmin', 2200, 'organizer'),
('b77a3e3e-9d3c-4b1a-a0c3-2c9ed82bb8e5', 'BracketKing', 'bracket.king@example.com', 'seed-hash', 'BracketKing', 2325, 'organizer'),
('c9f4f608-378f-47c0-b289-3f5d3cddf2a1', 'AimCoach', 'aim.coach@example.com', 'seed-hash', 'AimCoach', 2185, 'coach'),
('63239e3c-245c-47c7-b617-0c6d71b7eafe', 'DraftSensei', 'draft.sensei@example.com', 'seed-hash', 'DraftSensei', 2075, 'coach')
ON CONFLICT (username) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    elo = EXCLUDED.elo,
    role = EXCLUDED.role;

INSERT INTO communities (id, name, slug, tag, description, game_id, owner_id, member_count) VALUES
('bc82127f-9f2b-42a9-a22a-37f5bd7fa1dd', 'Dust Brotherhood', 'dust-brotherhood', 'DUST', 'CS2 ranked stacks, weekly cups and demo reviews', (SELECT id FROM games WHERE slug = 'cs2'), '7f4a2f35-8d10-4e0f-a0af-96e81a8c9e21', 1280),
('0b147b57-2807-48ec-bbda-5475d7aa9d16', 'Valorant Academy', 'valorant-academy', 'VA', 'Scrims, coaching rooms and agent-specific practice', (SELECT id FROM games WHERE slug = 'valorant'), '5b01db29-4385-4df1-9f2d-9d79b8767a50', 940),
('fbba1274-7ee0-4304-94fb-29c6a2d7ab70', 'Ancient Stack', 'ancient-stack', 'DOTA', 'Dota 2 captains, party finder and amateur leagues', (SELECT id FROM games WHERE slug = 'dota2'), '07b7dd50-f871-4c7f-b778-8470b399b45d', 710),
('e21b9c8b-b0cc-4e0e-b096-21f42589d7c5', 'Rift Rivals Hub', 'rift-rivals-hub', 'RIFT', 'League of Legends teams and tournament scouting', (SELECT id FROM games WHERE slug = 'lol'), '18ef6c5b-7c55-4fbf-9129-b86089c5e470', 615),
('d62ea491-691e-4683-9f0a-12199b72d5a1', 'Apex Drop Zone', 'apex-drop-zone', 'APEX', 'Apex Legends trio finder and kill race events', (SELECT id FROM games WHERE slug = 'apex-legends'), '6e0ebae1-63de-4469-8b42-7e311108a82b', 530),
('2ead4a49-e0bb-44d8-8bd9-330c5e8a6658', 'Boost League', 'boost-league', 'BOOST', 'Rocket League ladders and mechanics practice', (SELECT id FROM games WHERE slug = 'rocket-league'), '32cd61df-8a5e-4ef6-a21c-75ec6b3080c7', 460)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tournaments (id, name, slug, game_id, format, team_size, max_teams, start_date, prize_pool, status, organizer_id) VALUES
('c6bcd0b4-c1e7-49df-83a8-2d02bd72592b', 'Spring Masters CS2', 'spring-masters-cs2', (SELECT id FROM games WHERE slug = 'cs2'), 'single_elimination', 5, 128, NOW() + INTERVAL '5 days', 5000, 'registration', '83f6a54d-e5ff-4d46-b557-19e579e46f13'),
('55d91a86-6d91-4316-8277-14d1704f5e69', 'Valorant Night Series', 'valorant-night-series', (SELECT id FROM games WHERE slug = 'valorant'), 'round_robin', 5, 64, NOW() + INTERVAL '8 days', 1500, 'registration', '3db8e704-2d03-4348-947a-40ddba96d2e1'),
('acfcc02e-57ff-44cc-a797-d9422f0c9af3', 'Ancient Cup', 'ancient-cup', (SELECT id FROM games WHERE slug = 'dota2'), 'double_elimination', 5, 32, NOW() + INTERVAL '11 days', 2500, 'registration', 'b77a3e3e-9d3c-4b1a-a0c3-2c9ed82bb8e5'),
('d61d721c-62d6-4abf-b101-58c4b28e1ab9', 'Rift Amateur League', 'rift-amateur-league', (SELECT id FROM games WHERE slug = 'lol'), 'round_robin', 5, 40, NOW() + INTERVAL '14 days', 750, 'draft', '3db8e704-2d03-4348-947a-40ddba96d2e1'),
('9af71e8f-94f2-4c25-990a-4c047df5e7ff', 'Overwatch Clash', 'overwatch-clash', (SELECT id FROM games WHERE slug = 'overwatch2'), 'single_elimination', 5, 48, NOW() + INTERVAL '17 days', 1200, 'registration', '83f6a54d-e5ff-4d46-b557-19e579e46f13'),
('46435173-9bf9-4e9d-a797-2e1206e16f4f', 'Apex Trio Rush', 'apex-trio-rush', (SELECT id FROM games WHERE slug = 'apex-legends'), 'battle_royale_points', 3, 60, NOW() + INTERVAL '20 days', 1800, 'registration', 'b77a3e3e-9d3c-4b1a-a0c3-2c9ed82bb8e5'),
('2eb0dc8c-b60f-485f-993a-6da9ac22ceaa', 'Rocket Boost Open', 'rocket-boost-open', (SELECT id FROM games WHERE slug = 'rocket-league'), 'swiss', 3, 32, NOW() + INTERVAL '23 days', 600, 'draft', '3db8e704-2d03-4348-947a-40ddba96d2e1')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tournament_registrations (id, tournament_id, captain_id, team_name, status) VALUES
('568a8dfc-832e-4b86-9d93-b89844947502', 'c6bcd0b4-c1e7-49df-83a8-2d02bd72592b', '7f4a2f35-8d10-4e0f-a0af-96e81a8c9e21', 'Zero Squad', 'approved'),
('189a5f44-7709-477a-867c-3ff2789c3cb7', 'c6bcd0b4-c1e7-49df-83a8-2d02bd72592b', '5b01db29-4385-4df1-9f2d-9d79b8767a50', 'Matrix Five', 'approved'),
('ca63e0ae-c393-4e53-9767-d62a5e56bfa6', 'c6bcd0b4-c1e7-49df-83a8-2d02bd72592b', 'e86a0a0d-0f72-49b8-b7b7-3d30f93b037a', 'Venom Line', 'approved'),
('c65c2596-e72e-421b-ae60-30a04d2f6f43', '55d91a86-6d91-4316-8277-14d1704f5e69', '4fc583bf-06f6-44f4-a68e-2cf77dd14a4b', 'Recon Core', 'approved'),
('01e8e97d-2956-4968-b3ee-938a57cc46ff', '55d91a86-6d91-4316-8277-14d1704f5e69', '9b72d9e6-5d20-4687-a08e-f5c03d857b46', 'Blink Protocol', 'approved'),
('e0f523ab-c79d-424a-8104-6583882a6694', '55d91a86-6d91-4316-8277-14d1704f5e69', 'e86a0a0d-0f72-49b8-b7b7-3d30f93b037a', 'Toxic Execute', 'pending'),
('3ae1df45-8a9e-4af0-90b1-01ab08b819b5', 'acfcc02e-57ff-44cc-a797-d9422f0c9af3', '07b7dd50-f871-4c7f-b778-8470b399b45d', 'Sunstrike Five', 'approved'),
('59b6b6f5-0fd0-46bb-986d-adc3de173261', 'acfcc02e-57ff-44cc-a797-d9422f0c9af3', '83f6a54d-e5ff-4d46-b557-19e579e46f13', 'Ragnarok', 'approved'),
('8b62c924-6d48-42e3-bb3a-c2744d492fc1', 'd61d721c-62d6-4abf-b101-58c4b28e1ab9', '18ef6c5b-7c55-4fbf-9129-b86089c5e470', 'Rocket Minions', 'pending'),
('df9f4df7-786c-44cf-9cd9-f828d95d25af', 'd61d721c-62d6-4abf-b101-58c4b28e1ab9', 'b77a3e3e-9d3c-4b1a-a0c3-2c9ed82bb8e5', 'Bracket Breakers', 'approved'),
('54a4daf1-3a60-49d7-a2ec-64260d208d70', '9af71e8f-94f2-4c25-990a-4c047df5e7ff', '9b72d9e6-5d20-4687-a08e-f5c03d857b46', 'Pulse Bomb', 'approved'),
('9d2d840b-4b37-4084-a71d-9764cf926287', '9af71e8f-94f2-4c25-990a-4c047df5e7ff', '3db8e704-2d03-4348-947a-40ddba96d2e1', 'Nova Watch', 'approved'),
('348f92f9-eec1-4b42-80e2-d05abb359f96', '46435173-9bf9-4e9d-a797-2e1206e16f4f', '6e0ebae1-63de-4469-8b42-7e311108a82b', 'Phase Shift', 'approved'),
('d68d5142-ad93-4d05-9f5e-f6f273813f94', '46435173-9bf9-4e9d-a797-2e1206e16f4f', 'fd77f236-c944-41e1-9379-585fae68b75a', 'Stim Pack', 'approved'),
('c81a893a-018b-4bd4-851b-bc1cc2e5d6b9', '2eb0dc8c-b60f-485f-993a-6da9ac22ceaa', '32cd61df-8a5e-4ef6-a21c-75ec6b3080c7', 'Aerial Control', 'approved'),
('fc67d1f7-8b50-475e-8259-5105e4ae3306', '2eb0dc8c-b60f-485f-993a-6da9ac22ceaa', 'a58122d4-f0fc-4dd9-90e7-974b84223d97', 'Goal Line', 'approved')
ON CONFLICT (tournament_id, captain_id) DO NOTHING;

INSERT INTO matches (id, tournament_id, team1_id, team2_id, winner_id, status, score_team1, score_team2, finished_at, player_stats) VALUES
('9c59944a-d843-4df8-88e9-d6c34e1a8fb7', 'c6bcd0b4-c1e7-49df-83a8-2d02bd72592b', '568a8dfc-832e-4b86-9d93-b89844947502', '189a5f44-7709-477a-867c-3ff2789c3cb7', '568a8dfc-832e-4b86-9d93-b89844947502', 'finished', 2, 1, NOW() - INTERVAL '1 day', '[{"map":"Dust2","kills":24,"deaths":16}]'),
('1d350ce5-07f2-44bf-a449-0483279f3ed6', 'c6bcd0b4-c1e7-49df-83a8-2d02bd72592b', 'ca63e0ae-c393-4e53-9767-d62a5e56bfa6', '189a5f44-7709-477a-867c-3ff2789c3cb7', 'ca63e0ae-c393-4e53-9767-d62a5e56bfa6', 'finished', 2, 0, NOW() - INTERVAL '2 days', '[{"map":"Mirage","kills":19,"deaths":10}]'),
('d77cc6a0-dd1e-4b6c-8b89-c152b735a933', '55d91a86-6d91-4316-8277-14d1704f5e69', 'c65c2596-e72e-421b-ae60-30a04d2f6f43', '01e8e97d-2956-4968-b3ee-938a57cc46ff', '01e8e97d-2956-4968-b3ee-938a57cc46ff', 'finished', 11, 13, NOW() - INTERVAL '3 days', '[{"map":"Ascent","kills":28,"deaths":21}]'),
('8702db37-9035-4cc3-8f52-11d1d0f43558', '55d91a86-6d91-4316-8277-14d1704f5e69', 'e0f523ab-c79d-424a-8104-6583882a6694', 'c65c2596-e72e-421b-ae60-30a04d2f6f43', 'c65c2596-e72e-421b-ae60-30a04d2f6f43', 'finished', 9, 13, NOW() - INTERVAL '4 days', '[{"map":"Bind","kills":17,"deaths":19}]'),
('99676825-59bf-4fe8-a4b4-705984b570b0', 'acfcc02e-57ff-44cc-a797-d9422f0c9af3', '3ae1df45-8a9e-4af0-90b1-01ab08b819b5', '59b6b6f5-0fd0-46bb-986d-adc3de173261', '3ae1df45-8a9e-4af0-90b1-01ab08b819b5', 'finished', 2, 1, NOW() - INTERVAL '5 days', '[{"map":"Radiant","kills":12,"deaths":5}]'),
('cbb269e4-15d3-4aba-bb27-0c1f05967c72', 'd61d721c-62d6-4abf-b101-58c4b28e1ab9', '8b62c924-6d48-42e3-bb3a-c2744d492fc1', 'df9f4df7-786c-44cf-9cd9-f828d95d25af', 'df9f4df7-786c-44cf-9cd9-f828d95d25af', 'finished', 0, 2, NOW() - INTERVAL '6 days', '[{"map":"Summoners Rift","kills":8,"deaths":3}]'),
('3772ffcd-4a7a-4bc9-ac14-8dbe0c2e2cdd', '9af71e8f-94f2-4c25-990a-4c047df5e7ff', '54a4daf1-3a60-49d7-a2ec-64260d208d70', '9d2d840b-4b37-4084-a71d-9764cf926287', '54a4daf1-3a60-49d7-a2ec-64260d208d70', 'finished', 3, 2, NOW() - INTERVAL '7 days', '[{"map":"Kings Row","kills":31,"deaths":24}]'),
('9c34144f-33ec-427f-9407-0be50808c713', '46435173-9bf9-4e9d-a797-2e1206e16f4f', '348f92f9-eec1-4b42-80e2-d05abb359f96', 'd68d5142-ad93-4d05-9f5e-f6f273813f94', '348f92f9-eec1-4b42-80e2-d05abb359f96', 'finished', 64, 51, NOW() - INTERVAL '8 days', '[{"map":"Worlds Edge","kills":14,"deaths":2}]'),
('2cfaf7da-f53a-4499-97d0-66891a59cdb6', '2eb0dc8c-b60f-485f-993a-6da9ac22ceaa', 'c81a893a-018b-4bd4-851b-bc1cc2e5d6b9', 'fc67d1f7-8b50-475e-8259-5105e4ae3306', 'c81a893a-018b-4bd4-851b-bc1cc2e5d6b9', 'finished', 4, 3, NOW() - INTERVAL '9 days', '[{"map":"DFH Stadium","kills":0,"deaths":0}]'),
('f59d0c40-9634-4e96-82be-a8cf8cae7272', 'c6bcd0b4-c1e7-49df-83a8-2d02bd72592b', '568a8dfc-832e-4b86-9d93-b89844947502', 'ca63e0ae-c393-4e53-9767-d62a5e56bfa6', '568a8dfc-832e-4b86-9d93-b89844947502', 'finished', 2, 0, NOW() - INTERVAL '10 days', '[{"map":"Inferno","kills":22,"deaths":12}]')
ON CONFLICT (id) DO NOTHING;
