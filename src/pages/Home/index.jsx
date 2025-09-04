import { Gear, Plus, UserSwitch } from "phosphor-react";
import { useEffect, useState } from 'react';
import './styles.css';

export function Home() {
  const [victoryThreshold, setVictoryThreshold] = useState(() => {
    const saved = localStorage.getItem('victoryThreshold');
    return saved ? parseInt(saved) : 5;
  });
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({ name: '', avatar: '' })
  const [count, setCount] = useState(0);
  const [winners, setWinners] = useState([]);
  const [winnerStats, setWinnerStats] = useState({});
  const [showLegend, setShowLegend] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(victoryThreshold);

  const saveSettings = () => {
    localStorage.setItem('victoryThreshold', tempThreshold.toString());
    setVictoryThreshold(tempThreshold);
    setShowModal(false);
  };

  const openModal = () => {
    setTempThreshold(victoryThreshold);
    setShowModal(true);
  };

  const closeModal = () => {
    setTempThreshold(victoryThreshold);
    setShowModal(false);
  };

  function addUser(){
    if(userName === ""){
      /* VALIDA INPUT VAZIO */
      document.getElementById("inputNameUser").placeholder = "Digite o nome do participante (campo obrigatório)";
      document.getElementById("inputNameUser").focus()
    } else{
      // Separa os nomes por vírgula e remove espaços em branco
      const names = userName.split(',').map(name => name.trim()).filter(name => name !== '');
      
      const newUsers = names.map(name => ({
        id: Math.floor(Date.now() * Math.random()).toString(36),
        name: name,
        time: new Date().toLocaleTimeString('pt-br', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      }));

      setUsers(prevState => [...prevState, ...newUsers]);
      setUserName(''); // Limpa o input

      /* REMOVE VALOR INPUT */
      document.getElementById("inputNameUser").value = '';
      document.getElementById("inputNameUser").focus()
      document.getElementById("list-users-legend").style.display = 'none';
    }
  } 

  const removeUser = (id) => {
    setUsers(users.filter((usuario) => usuario.id !== id));
    let listBeforeRemove = users.length -1

    if( listBeforeRemove === 0){
      document.getElementById("list-users-legend").style.display = 'block';
    }
  };
  
  function raffleUser(){
    /* PEGA O ARRAY DE USUÁRIOS E SORTEIA 1 */
    if(users.length <= 1){
      document.getElementById("inputNameUser").placeholder = "Digite um nome (campo obrigatório)";
      document.getElementById("inputNameUser").focus()
    } else{
      let u = users;
      let el = u[Math.floor(Math.random() * u.length)];
  
      // Adiciona o ganhador ao histórico
      const newWinner = {
        id: Math.floor(Date.now() * Math.random()).toString(36),
        name: el.name,
        raffleNumber: count + 1,
        timestamp: new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit', 
          year: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
      
      setWinners(prevWinners => [...prevWinners, newWinner]);
      
      // Atualiza estatísticas dos ganhadores
      setWinnerStats(prevStats => ({
        ...prevStats,
        [el.name]: (prevStats[el.name] || 0) + 1
      }));
  
      document.getElementById("raffle-user").innerText = el.name;
      document.getElementById("container-raffle-user").style.display = 'block';
    }
  }

  useEffect(() => {
    fetch('https://api.github.com/users/shintaku-michel')
    .then(response => response.json())
    .then(data => {
      setUser({
        name: data.name,
        avatar: data.avatar_url,
        location: data.location,
        url: data.html_url
      })
    } ) 
    .catch(error => {
      console.error("Erro ao buscar dados do usuário no github", error);
    },
  )}, []);

  return (
    <div className="container-global">
      <div className='container'>
        <header>
          <div className="content-user">

            <img src={user.avatar} alt="Imagem perfil" />
            <div>
              <strong>{user.name} - Dev</strong>
              <span>Location: {user.location} - <a href={user.url}>gitHub</a></span>
            </div>
          </div>
        </header>

        <h1>Sorteio de brindes</h1>
        <input
          id="inputNameUser" 
          type="text" 
          placeholder="Use vírgula para cadastrar múltiplos participantes"
          value={userName}
          onChange={ callbackFuncao => setUserName(callbackFuncao.target.value)}
        />

        <div className='container-btns'>
          <button type="button" onClick={addUser}>
            <Plus size={20} /> Adicionar
          </button>

          <button type="button" onClick={
            function() {
              raffleUser()
              if(users.length >= 2){
                setCount(count + 1)
              }
            }
          }><UserSwitch size={20} /> Sortear</button>
        </div>

        <div className='list-users'>
          <h2>Participantes <span>({users.length})</span></h2>
          {showLegend && <div id='list-users-legend'>[Lista vazia]</div>}
        </div>

        {
          users.map( (usuario) => (
            <div className='card' key={usuario.id}>
                <div>
                    <span className="user-time">{usuario.time}</span>
                    <strong>{usuario.name}</strong>
                </div>
                <div>
                    <a onClick={ () => removeUser(usuario.id) }
                      className='link-card' 
                      href="#">
                      <span className='btn_remove--text'>Excluir</span>
                    </a>
                </div>
            </div>
          ))
        }
      </div>

      <div className="elegant-ranking">
        <div className="ranking-background-pattern"></div>
        <div className="ranking-bg-blur ranking-bg-blur-1"></div>
        <div className="ranking-bg-blur ranking-bg-blur-2"></div>
        
        <div className="ranking-content">
          <div className="ranking-header">
            <h2 className="ranking-title">
              Ranking
            </h2>
            <div className="ranking-header-right">
              <div className="competitors-badge">
                {users.length} competidores
              </div>
              <button onClick={openModal} className="settings-button">
                <Gear size={18} />
              </button>
            </div>
          </div>

          <div className="ranking-cards">
            {(() => {
              // Cria um ranking completo incluindo todos os participantes
              const allParticipants = {};
              
              // Adiciona todos os usuários da lista com 0 vitórias inicialmente
              users.forEach(user => {
                allParticipants[user.name] = 0;
              });
              
              // Sobrescreve com as vitórias reais dos winnerStats
              Object.entries(winnerStats).forEach(([name, wins]) => {
                allParticipants[name] = wins;
              });
              
              const sortedEntries = Object.entries(allParticipants).sort(([,a], [,b]) => b - a);
              
              return sortedEntries.map(([name, wins], index) => {
                // Calcula a posição baseada em quantos níveis diferentes de vitórias existem acima
                const uniqueWinsAbove = new Set();
                for (let i = 0; i < index; i++) {
                  if (sortedEntries[i][1] > wins) {
                    uniqueWinsAbove.add(sortedEntries[i][1]);
                  }
                }
                const actualPosition = uniqueWinsAbove.size + 1;
                const isFirst = actualPosition === 1;
                const isSecond = actualPosition === 2;
                const isThird = actualPosition === 3;
                const medalEmoji = actualPosition === 1 ? '1º' : actualPosition === 2 ? '2º' : actualPosition === 3 ? '3º' : '';
                
                return (
                  <div key={name} className={`ranking-card ${
                    isFirst ? 'ranking-card-first' : isSecond ? 'ranking-card-second' : isThird ? 'ranking-card-third' : 'ranking-card-normal'
                  }`}>
                    <div className="ranking-card-shimmer"></div>
                    <div className="ranking-card-content">
                      <div className="ranking-card-left">
                        <div className={`ranking-position ${
                          isFirst ? 'ranking-position-first' : isSecond ? 'ranking-position-second' : isThird ? 'ranking-position-third' : 'ranking-position-normal'
                        }`}>
                          {medalEmoji || `${actualPosition}º`}
                        </div>
                        <div className="ranking-player-info">
                          <div className="player-name-container">
                            {wins >= victoryThreshold && (
                              <span className="winner-badge">VENCEDOR</span>
                            )}
                            
                            <span className={`ranking-player-name ${
                              isFirst ? 'ranking-player-name-first' : isSecond ? 'ranking-player-name-second' : isThird ? 'ranking-player-name-third' : 'ranking-player-name-normal'
                            }`}>
                              {name}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ranking-card-right">
                        <div className={`wins-badge ${
                          isFirst ? 'wins-badge-first' : isSecond ? 'wins-badge-second' : isThird ? 'wins-badge-third' : 'wins-badge-normal'
                        }`}>
                          {Math.min(wins, victoryThreshold)} vitória{Math.min(wins, victoryThreshold) > 1 ? 's' : ''}
                        </div>
                        {wins > victoryThreshold && (
                          <div className="extra-wins">
                            +{wins - victoryThreshold}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
            {users.length === 0 && (
              <div className="empty-ranking">
                <p className="empty-ranking-text">Nenhum participante adicionado</p>
                <p className="empty-ranking-subtext">Adicione participantes para ver o ranking!</p>
              </div>
            )}
          </div>
          
          <div className="history-section">
            <div className="history-header">
              <h3 className="history-title">
                Histórico
              </h3>
              {winners.length > 0 && (
                <div className="history-count-badge">
                  {winners.length} sorteio{winners.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div className="history-list custom-scrollbar">
              {winners.length === 0 ? (
                <div className="empty-history">
                  <p className="empty-history-text">Histórico vazio</p>
                  <p className="empty-history-subtext">Os sorteios aparecerão aqui</p>
                </div>
              ) : (
                winners.slice().reverse().map((winner, index) => (
                  <div key={winner.id} className="history-card">
                    <div className="history-card-content">
                      <div className="history-card-left">
                        <div className="content-badge">
                          <strong className="history-winner-name">
                            {winner.name}
                          </strong>
                          <span>
                            {index === 0 && <span className="recent-badge">RECENTE</span>}
                          </span>
                        </div>
                      </div>
                      <span className="history-timestamp">
                        {winner.timestamp}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Configurações do Sorteio</h3>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <label htmlFor="victory-threshold">
                Número de vitórias para vencer:
              </label>
              <input
                id="victory-threshold"
                type="number"
                min="1"
                max="50"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(parseInt(e.target.value) || 1)}
                className="threshold-input"
              />
              <p className="threshold-info">
                Atual: {victoryThreshold} vitória{victoryThreshold > 1 ? 's' : ''}
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="cancel-button">
                Cancelar
              </button>
              <button onClick={saveSettings} className="save-button">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
