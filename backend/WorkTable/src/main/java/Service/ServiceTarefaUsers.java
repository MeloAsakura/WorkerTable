package Service;

import Model.Tarefa;
import Model.User;
import Repository.TarefaUser.TarefaUserRepo;

import java.sql.SQLException;
import java.util.List;
import java.util.Objects;

public class ServiceTarefaUsers {


    private final TarefaUserRepo repository;
    public ServiceTarefaUsers(TarefaUserRepo repository){
        this.repository=repository;
    }


    public void createGroupForTarefa(Tarefa tarefa, List<User> users) throws SQLException {
        Objects.requireNonNull(tarefa,"Tarefa nao pode ser nula");
        if (users.isEmpty()) {
            throw new IllegalArgumentException("A lista de usuarios nao pode estar vazia");
        }

        int i=repository.insertGroupForTarefa(tarefa,users);

        if(i==0){
            System.out.println("ERROR: USUARIOS NAO ADICIONADOS NA TAREFA");
        }
        users.forEach(System.out::println);
    }

    public void findTarefasByUsersId(Long id) throws SQLException {
        if (id == null) {
            throw new IllegalArgumentException("ID do usuario nao pode ser nulo");
        }

        List<Tarefa>tarefasByUser=repository.findTarefasByUsersId(id);
        if(tarefasByUser.isEmpty()){
            System.out.println("Esse usuario nao possui tarefas");
        }

        tarefasByUser.forEach(System.out::println);
    }

    public void findUsersByTarefa(Tarefa tarefa) throws SQLException {
        Objects.requireNonNull(tarefa,"Passe a tarefa");

       List<User>userTarefa= repository.findUsersByTarefa(tarefa);

       if(userTarefa.isEmpty()){
           System.out.println("Essa tarefa nao possui usuarios");
       }
       userTarefa.forEach(System.out::println);
    }

    public void deleteUserFromTarefa(Long userId,Long tarefaId) throws SQLException {
        if(userId==null || tarefaId==null ){
            throw new IllegalArgumentException("Id nao informado");
        }
        int i=repository.deleteUserFromTarefaById(userId,tarefaId);

        if(i==0){
            throw new Error("Nao houve remocao do usuario");
        }else{
            System.out.println("Usuario removido");
        }
    }
}
