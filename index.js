import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Filter, Moon, Sun } from 'lucide-react';

export default function GameCollectionManager() {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    platform: '',
    genre: '',
    status: 'unplayed',
    purchaseDate: '',
    notes: ''
  });

  // Load games and theme from storage on mount
  useEffect(() => {
    loadGames();
    loadTheme();
  }, []);

  const loadGames = async () => {
    try {
      const result = await window.storage.get('game-collection');
      if (result && result.value) {
        setGames(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('初回起動または読み込みエラー:', error);
    }
  };

  const loadTheme = async () => {
    try {
      const result = await window.storage.get('theme-preference');
      if (result && result.value) {
        setDarkMode(result.value === 'dark');
      }
    } catch (error) {
      console.log('テーマ設定の読み込み:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    try {
      await window.storage.set('theme-preference', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('テーマ保存エラー:', error);
    }
  };

  const saveGames = async (updatedGames) => {
    try {
      await window.storage.set('game-collection', JSON.stringify(updatedGames));
      setGames(updatedGames);
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    }
  };

  const addGame = () => {
    if (!newGame.title || !newGame.platform) {
      alert('タイトルとプラットフォームは必須です');
      return;
    }

    const gameToAdd = {
      ...newGame,
      id: Date.now(),
      addedDate: new Date().toISOString()
    };

    const updatedGames = [...games, gameToAdd];
    saveGames(updatedGames);

    setNewGame({
      title: '',
      platform: '',
      genre: '',
      status: 'unplayed',
      purchaseDate: '',
      notes: ''
    });
    setShowAddForm(false);
  };

  const deleteGame = (id) => {
    if (confirm('このゲームを削除しますか?')) {
      const updatedGames = games.filter(game => game.id !== id);
      saveGames(updatedGames);
    }
  };

  const updateGameStatus = (id, newStatus) => {
    const updatedGames = games.map(game =>
      game.id === id ? { ...game, status: newStatus } : game
    );
    saveGames(updatedGames);
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.genre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || game.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || game.status === filterStatus;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  const platforms = [...new Set(games.map(g => g.platform))];
  const statusOptions = {
    'unplayed': '未プレイ',
    'playing': 'プレイ中',
    'completed': 'クリア済み',
    'on-hold': '保留中'
  };

  const getStatusColor = (status) => {
    const colors = {
      'unplayed': 'bg-gray-100 text-gray-700',
      'playing': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'on-hold': 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'} p-6 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>🎮 ゲームコレクション</h1>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition`}
              aria-label="テーマ切り替え"
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
              <input
                type="text"
                placeholder="ゲームタイトルやジャンルで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className={`px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors`}
              >
                <option value="all">全プラットフォーム</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors`}
              >
                <option value="all">全ステータス</option>
                {Object.entries(statusOptions).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              追加
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg transition-colors`}>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{games.length}</div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>総数</div>
            </div>
            <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-3 rounded-lg transition-colors`}>
              <div className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                {games.filter(g => g.status === 'playing').length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>プレイ中</div>
            </div>
            <div className={`${darkMode ? 'bg-green-900' : 'bg-green-50'} p-3 rounded-lg transition-colors`}>
              <div className={`text-2xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>
                {games.filter(g => g.status === 'completed').length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>クリア済み</div>
            </div>
            <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg transition-colors`}>
              <div className={`text-2xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {games.filter(g => g.status === 'unplayed').length}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>未プレイ</div>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6 transition-colors duration-300`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>新しいゲームを追加</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="ゲームタイトル *"
                value={newGame.title}
                onChange={(e) => setNewGame({...newGame, title: e.target.value})}
                className={`px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors`}
              />
              <input
                type="text"
                placeholder="プラットフォーム (例: Nintendo Switch) *"
                value={newGame.platform}
                onChange={(e) => setNewGame({...newGame, platform: e.target.value})}
                className={`px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors`}
              />
              <input
                type="text"
                placeholder="ジャンル (例: RPG, アクション)"
                value={newGame.genre}
                onChange={(e) => setNewGame({...newGame, genre: e.target.value})}
                className={`px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors`}
              />
              <select
                value={newGame.status}
                onChange={(e) => setNewGame({...newGame, status: e.target.value})}
                className={`px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors`}
              >
                {Object.entries(statusOptions).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <input
                type="date"
                placeholder="購入日"
                value={newGame.purchaseDate}
                onChange={(e) => setNewGame({...newGame, purchaseDate: e.target.value})}
                className={`px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors`}
              />
              <input
                type="text"
                placeholder="メモ"
                value={newGame.notes}
                onChange={(e) => setNewGame({...newGame, notes: e.target.value})}
                className={`px-4 py-2 border ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors`}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={addGame}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                追加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className={`px-6 py-2 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} rounded-lg transition`}
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* Games List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGames.length === 0 ? (
            <div className={`col-span-full text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {games.length === 0 ? 'ゲームを追加してください' : '該当するゲームが見つかりません'}
            </div>
          ) : (
            filteredGames.map(game => (
              <div key={game.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-800'} flex-1`}>{game.title}</h3>
                  <button
                    onClick={() => deleteGame(game.id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    <span className="font-semibold">プラットフォーム:</span> {game.platform}
                  </div>
                  {game.genre && (
                    <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      <span className="font-semibold">ジャンル:</span> {game.genre}
                    </div>
                  )}
                  
                  <div>
                    <select
                      value={game.status}
                      onChange={(e) => updateGameStatus(game.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(game.status)}`}
                    >
                      {Object.entries(statusOptions).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {game.purchaseDate && (
                    <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      <span className="font-semibold">購入日:</span> {game.purchaseDate}
                    </div>
                  )}
                  
                  {game.notes && (
                    <div className={`${darkMode ? 'text-gray-300 border-gray-600' : 'text-gray-600 border-gray-200'} mt-2 pt-2 border-t`}>
                      {game.notes}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
